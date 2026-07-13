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
  stripeSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: StoredOrderItem[];
}

interface StoredIdempotency {
  id: string;
  key: string;
  userId: string;
  orderId: string;
  createdAt: Date;
}

const prismaStore = vi.hoisted(() => ({
  orders: [] as StoredOrder[],
  idempotency: [] as StoredIdempotency[],
  failCreate: false,
  reset() {
    this.orders = [];
    this.idempotency = [];
    this.failCreate = false;
  },
}));

function createOrderRecord(data: {
  userId: string;
  total: number;
  status?: string;
  stripeSessionId?: string | null;
  items: { create: Array<{ productId: string; quantity: number }> };
}): StoredOrder {
  if (prismaStore.failCreate) {
    throw new Error("db unavailable");
  }
  const id = crypto.randomUUID();
  const createdAt = new Date();
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
    stripeSessionId: data.stripeSessionId ?? null,
    createdAt,
    updatedAt: createdAt,
    items,
  };
  prismaStore.orders.push(order);
  return order;
}

const authState = vi.hoisted(() => ({
  userId: null as string | null,
}));

vi.mock("@/lib/auth", () => ({
  getUserIdSafe: async () => authState.userId,
}));

vi.mock("@/lib/logger", () => ({
  log: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const orderApi = {
    create: async ({
      data,
    }: {
      data: {
        userId: string;
        total: number;
        status?: string;
        stripeSessionId?: string | null;
        items: { create: Array<{ productId: string; quantity: number }> };
      };
    }) => {
      const order = createOrderRecord(data);
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
    findFirst: async ({
      where,
    }: {
      where?: { id?: string; userId?: string; stripeSessionId?: string };
    }) => {
      const order = prismaStore.orders.find(
        (candidate) =>
          (!where?.id || candidate.id === where.id) &&
          (!where?.userId || candidate.userId === where.userId) &&
          (!where?.stripeSessionId ||
            candidate.stripeSessionId === where.stripeSessionId)
      );
      if (!order) {
        return null;
      }
      return { ...order, items: order.items.map((item) => ({ ...item })) };
    },
    findUnique: async ({
      where,
    }: {
      where: { stripeSessionId?: string };
    }) => {
      const order = prismaStore.orders.find(
        (candidate) =>
          where.stripeSessionId !== undefined &&
          candidate.stripeSessionId === where.stripeSessionId
      );
      if (!order) {
        return null;
      }
      return { ...order, items: order.items.map((item) => ({ ...item })) };
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { status?: string };
    }) => {
      const order = prismaStore.orders.find(
        (candidate) => candidate.id === where.id
      );
      if (!order) {
        throw new Error(`Order not found: ${where.id}`);
      }
      if (data.status) {
        order.status = data.status;
      }
      order.updatedAt = new Date();
      return { ...order, items: order.items.map((item) => ({ ...item })) };
    },
  };

  const idempotencyApi = {
    findUnique: async ({
      where,
    }: {
      where: { userId_key: { userId: string; key: string } };
    }) => {
      const record = prismaStore.idempotency.find(
        (row) =>
          row.userId === where.userId_key.userId &&
          row.key === where.userId_key.key
      );
      if (!record) {
        return null;
      }
      const order = prismaStore.orders.find((o) => o.id === record.orderId);
      if (!order) {
        return null;
      }
      return {
        ...record,
        order: { ...order, items: order.items.map((item) => ({ ...item })) },
      };
    },
    create: async ({
      data,
    }: {
      data: { key: string; userId: string; orderId: string };
    }) => {
      const record: StoredIdempotency = {
        id: crypto.randomUUID(),
        key: data.key,
        userId: data.userId,
        orderId: data.orderId,
        createdAt: new Date(),
      };
      prismaStore.idempotency.push(record);
      return record;
    },
  };

  return {
    prisma: {
      order: orderApi,
      idempotencyRecord: idempotencyApi,
      $transaction: async <T>(
        fn: (tx: { order: typeof orderApi; idempotencyRecord: typeof idempotencyApi }) => Promise<T>
      ) => fn({ order: orderApi, idempotencyRecord: idempotencyApi }),
    },
  };
});

import { GET, PATCH, POST } from "./route";

function getRequest(url = "http://localhost/api/orders"): Request {
  return new Request(url, { method: "GET" });
}

function postRequest(
  body: unknown,
  headers: Record<string, string> = {}
): Request {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function patchRequest(body: unknown): Request {
  return new Request("http://localhost/api/orders", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validDraft = {
  total: 258,
  items: [{ id: "1", quantity: 2 }],
};

describe("orders API route (integration)", () => {
  beforeEach(() => {
    prismaStore.reset();
    authState.userId = "user-a";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when the request is unauthenticated", async () => {
      authState.userId = null;

      const res = await GET(getRequest());

      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
    });

    it("returns only the authenticated user's orders", async () => {
      await POST(postRequest(validDraft));

      authState.userId = "user-b";
      await POST(postRequest(validDraft));

      authState.userId = "user-a";
      const res = await GET(getRequest());
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0]).toMatchObject({
        userId: "user-a",
        total: 258,
        status: "processing",
        items: [{ id: "1", quantity: 2 }],
      });
    });
  });

  describe("POST (checkout)", () => {
    it("returns 401 when the request is unauthenticated", async () => {
      authState.userId = null;

      const res = await POST(postRequest(validDraft));

      expect(res.status).toBe(401);
    });

    it("creates an order and returns 201 with the persisted record", async () => {
      const res = await POST(postRequest(validDraft));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.data).toMatchObject({
        userId: "user-a",
        total: 258,
        status: "processing",
        items: [{ id: "1", quantity: 2 }],
      });
      expect(body.data.id).toMatch(/^[0-9a-f-]{36}$/);

      const listed = await (await GET(getRequest())).json();
      expect(listed.data).toHaveLength(1);
      expect(listed.data[0].id).toBe(body.data.id);
    });

    it("replays the same order for a repeated Idempotency-Key", async () => {
      const key = "checkout-key-abc-123";
      const first = await POST(
        postRequest(validDraft, { "Idempotency-Key": key })
      );
      const firstBody = await first.json();

      const second = await POST(
        postRequest(validDraft, { "Idempotency-Key": key })
      );
      const secondBody = await second.json();

      expect(first.status).toBe(201);
      expect(second.status).toBe(200);
      expect(secondBody.data.id).toBe(firstBody.data.id);
      expect(prismaStore.orders).toHaveLength(1);
    });

    it("returns 400 for a malformed Idempotency-Key", async () => {
      const res = await POST(
        postRequest(validDraft, { "Idempotency-Key": "short" })
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "Invalid Idempotency-Key header",
      });
    });

    it("returns 400 when the cart contains an unknown product", async () => {
      const res = await POST(
        postRequest({ total: 10, items: [{ id: "999", quantity: 1 }] })
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "Invalid order payload",
      });
    });

    it("returns 400 when the total is not a valid positive number", async () => {
      const res = await POST(
        postRequest({ total: 0, items: [{ id: "1", quantity: 2 }] })
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "Invalid order payload",
      });
    });

    it("rejects a tampered total that does not match catalog prices", async () => {
      const res = await POST(
        postRequest({ total: 1, items: [{ id: "1", quantity: 2 }] })
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "Order total does not match catalog prices",
      });
    });

    it("rejects when cart quantity exceeds catalog stock", async () => {
      const res = await POST(
        postRequest({ total: 351, items: [{ id: "3", quantity: 9 }] })
      );

      expect(res.status).toBe(409);
      await expect(res.json()).resolves.toEqual({
        error:
          "Insufficient stock for Gaming Mouse Pad: requested 9, available 8",
      });
    });

    it("returns 500 when the order store fails to persist", async () => {
      prismaStore.failCreate = true;

      const res = await POST(postRequest(validDraft));

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: "Failed to create order",
      });
    });
  });

  describe("PATCH (mark paid)", () => {
    it("returns 401 when the request is unauthenticated", async () => {
      authState.userId = null;

      const res = await PATCH(patchRequest({ id: crypto.randomUUID() }));

      expect(res.status).toBe(401);
    });

    it("returns 400 when the order id is malformed", async () => {
      const res = await PATCH(patchRequest({ id: "not-a-uuid" }));

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: "Invalid order id" });
    });

    it("returns 404 when the order does not exist for the user", async () => {
      const res = await PATCH(
        patchRequest({ id: "00000000-0000-0000-0000-000000000000" })
      );

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "Order not found" });
    });

    it("marks an existing order as paid", async () => {
      const created = await (await POST(postRequest(validDraft))).json();

      const res = await PATCH(patchRequest({ id: created.data.id }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toMatchObject({ id: created.data.id, status: "paid" });

      const listed = await (await GET(getRequest())).json();
      expect(listed.data[0].status).toBe("paid");
    });

    it("does not let one user mark another user's order as paid", async () => {
      const created = await (await POST(postRequest(validDraft))).json();

      authState.userId = "user-b";
      const res = await PATCH(patchRequest({ id: created.data.id }));

      expect(res.status).toBe(404);

      authState.userId = "user-a";
      const listed = await (await GET(getRequest())).json();
      expect(listed.data[0].status).toBe("processing");
    });
  });
});
