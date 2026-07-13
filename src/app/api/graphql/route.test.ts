import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface StoredOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
}

interface StoredOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
  items: StoredOrderItem[];
}

const prismaStore = vi.hoisted(() => ({
  orders: [] as StoredOrder[],
  reset() {
    this.orders = [];
  },
}));

const authState = vi.hoisted(() => ({
  userId: null as string | null,
}));

vi.mock("@/lib/auth", () => ({
  getUserIdSafe: async () => authState.userId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      create: async ({
        data,
      }: {
        data: {
          userId: string;
          total: number;
          status?: string;
          items: { create: Array<{ productId: string; quantity: number }> };
        };
      }) => {
        const id = crypto.randomUUID();
        const items = data.items.create.map((item, index) => ({
          id: `${id}-item-${index}`,
          orderId: id,
          productId: item.productId,
          quantity: item.quantity,
        }));
        const order: StoredOrder = {
          id,
          userId: data.userId,
          total: data.total,
          status: data.status ?? "processing",
          createdAt: new Date(),
          items,
        };
        prismaStore.orders.push(order);
        return { ...order, items: order.items.map((item) => ({ ...item })) };
      },
      findMany: async ({
        where,
        orderBy,
      }: {
        where?: { userId?: string };
        orderBy?: { createdAt: "desc" };
      }) => {
        let results = [...prismaStore.orders];
        if (where?.userId) {
          results = results.filter((order) => order.userId === where.userId);
        }
        if (orderBy?.createdAt === "desc") {
          results.sort(
            (a, b) =>
              b.createdAt.getTime() - a.createdAt.getTime() ||
              prismaStore.orders.indexOf(b) - prismaStore.orders.indexOf(a)
          );
        }
        return results.map((order) => ({
          ...order,
          items: order.items.map((item) => ({ ...item })),
        }));
      },
    },
  },
}));

import { POST } from "./route";

function graphqlRequest(query: string, variables?: Record<string, unknown>) {
  return new Request("http://localhost/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
}

const CREATE_ORDER = `
  mutation {
    createOrder(total: 258, items: [{ id: "1", quantity: 2 }]) {
      id
      total
      status
      items { id quantity }
    }
  }
`;

describe("graphql API route (integration)", () => {
  beforeEach(() => {
    prismaStore.reset();
    authState.userId = "user-a";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when the query is missing", async () => {
    const res = await POST(
      new Request("http://localhost/api/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors[0].message).toBe("Missing GraphQL query");
  });

  it("resolves the products query against the real catalog", async () => {
    const res = await POST(graphqlRequest(`query { products { id title } }`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.products).toHaveLength(3);
    expect(body.data.products[0]).toMatchObject({ id: "1" });
  });

  it("creates an order through the createOrder mutation", async () => {
    const res = await POST(graphqlRequest(CREATE_ORDER));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data.createOrder).toMatchObject({
      total: 258,
      status: "processing",
      items: [{ id: "1", quantity: 2 }],
    });
    expect(prismaStore.orders).toHaveLength(1);
  });

  it("rejects the createOrder mutation when unauthenticated", async () => {
    authState.userId = null;

    const res = await POST(graphqlRequest(CREATE_ORDER));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.errors[0].message).toBe("Unauthorized");
    expect(prismaStore.orders).toHaveLength(0);
  });

  it("rejects a tampered total in the createOrder mutation", async () => {
    const res = await POST(
      graphqlRequest(`
        mutation {
          createOrder(total: 1, items: [{ id: "1", quantity: 2 }]) {
            id
          }
        }
      `)
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.errors[0].message).toBe(
      "Order total does not match catalog prices"
    );
    expect(prismaStore.orders).toHaveLength(0);
  });

  it("rejects createOrder when quantity exceeds catalog stock", async () => {
    const res = await POST(
      graphqlRequest(`
        mutation {
          createOrder(total: 351, items: [{ id: "3", quantity: 9 }]) {
            id
          }
        }
      `)
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.errors[0].message).toBe(
      "Insufficient stock for Gaming Mouse Pad: requested 9, available 8"
    );
    expect(prismaStore.orders).toHaveLength(0);
  });

  it("returns the authenticated user's orders via the orders query", async () => {
    await POST(graphqlRequest(CREATE_ORDER));

    const res = await POST(
      graphqlRequest(`query { orders { id total status } }`)
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.orders).toHaveLength(1);
    expect(body.data.orders[0]).toMatchObject({ total: 258, status: "processing" });
  });

  it("returns no orders for an unauthenticated orders query", async () => {
    await POST(graphqlRequest(CREATE_ORDER));
    authState.userId = null;

    const res = await POST(graphqlRequest(`query { orders { id } }`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.orders).toEqual([]);
  });
});
