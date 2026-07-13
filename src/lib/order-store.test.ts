import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderDraft } from "@/lib/types";

const prismaStore = vi.hoisted(() => {
  type StoredOrderItem = {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
  };

  type StoredOrder = {
    id: string;
    userId: string;
    total: number;
    status: string;
    stripeSessionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: StoredOrderItem[];
  };

  type StoredIdempotency = {
    id: string;
    key: string;
    userId: string;
    orderId: string;
    createdAt: Date;
  };

  return {
    orders: [] as StoredOrder[],
    idempotency: [] as StoredIdempotency[],
    reset() {
      this.orders = [];
      this.idempotency = [];
    },
    createOrderRecord(data: {
      userId: string;
      total: number;
      status?: string;
      stripeSessionId?: string | null;
      items: { create: Array<{ productId: string; quantity: number }> };
    }): StoredOrder {
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
      this.orders.push(order);
      return order;
    },
  };
});

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
    }) => prismaStore.createOrderRecord(data),
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
        results.sort((a, b) => {
          const byDate = b.createdAt.getTime() - a.createdAt.getTime();
          if (byDate !== 0) {
            return byDate;
          }
          return prismaStore.orders.indexOf(b) - prismaStore.orders.indexOf(a);
        });
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
      return {
        ...order,
        items: order.items.map((item) => ({ ...item })),
      };
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
      return {
        ...order,
        items: order.items.map((item) => ({ ...item })),
      };
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
      return {
        ...order,
        items: order.items.map((item) => ({ ...item })),
      };
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
        order: {
          ...order,
          items: order.items.map((item) => ({ ...item })),
        },
      };
    },
    create: async ({
      data,
    }: {
      data: { key: string; userId: string; orderId: string };
    }) => {
      const record = {
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
        fn: (tx: {
          order: typeof orderApi;
          idempotencyRecord: typeof idempotencyApi;
        }) => Promise<T>
      ) => fn({ order: orderApi, idempotencyRecord: idempotencyApi }),
    },
  };
});

import {
  cancelOrder,
  createOrder,
  createOrderWithIdempotency,
  createPaidOrderFromStripe,
  findOrderByStripeSessionId,
  listAllOrders,
  listOrders,
  markOrderAsPaid,
} from "./order-store";

const sampleDraft: OrderDraft = {
  total: 258,
  items: [{ id: "1", quantity: 2 }],
};

describe("order-store", () => {
  beforeEach(() => {
    prismaStore.reset();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("order-uuid-1");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("createOrder", () => {
    it("returns an order with id, userId, and status processing", async () => {
      const order = await createOrder("user-a", sampleDraft);

      expect(order).toMatchObject({
        id: "order-uuid-1",
        userId: "user-a",
        status: "processing",
        total: sampleDraft.total,
        items: sampleDraft.items,
      });
      expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("prepends new orders so the latest appears first for the user", async () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("order-1")
        .mockReturnValueOnce("order-2");

      await createOrder("user-a", sampleDraft);
      await createOrder("user-a", { total: 99, items: [{ id: "2", quantity: 1 }] });

      const orders = await listOrders("user-a");
      expect(orders.map((order) => order.id)).toEqual(["order-2", "order-1"]);
    });
  });

  describe("createOrderWithIdempotency", () => {
    it("creates once and replays the same order for the same key", async () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("order-1")
        .mockReturnValueOnce("idem-1");

      const first = await createOrderWithIdempotency(
        "user-a",
        sampleDraft,
        "key-checkout-1"
      );
      const second = await createOrderWithIdempotency(
        "user-a",
        sampleDraft,
        "key-checkout-1"
      );

      expect(first.created).toBe(true);
      expect(second.created).toBe(false);
      expect(second.order.id).toBe(first.order.id);
      expect(prismaStore.orders).toHaveLength(1);
    });
  });

  describe("createPaidOrderFromStripe", () => {
    it("creates a paid order keyed by stripe session id", async () => {
      const result = await createPaidOrderFromStripe(
        "user-a",
        sampleDraft,
        "cs_test_123"
      );

      expect(result.created).toBe(true);
      expect(result.order).toMatchObject({
        status: "paid",
        stripeSessionId: "cs_test_123",
      });

      const replay = await createPaidOrderFromStripe(
        "user-a",
        sampleDraft,
        "cs_test_123"
      );
      expect(replay.created).toBe(false);
      expect(replay.order.id).toBe(result.order.id);
    });

    it("finds the order by stripe session for the owning user", async () => {
      await createPaidOrderFromStripe("user-a", sampleDraft, "cs_test_abc");

      await expect(
        findOrderByStripeSessionId("user-a", "cs_test_abc")
      ).resolves.toMatchObject({ stripeSessionId: "cs_test_abc" });
      await expect(
        findOrderByStripeSessionId("user-b", "cs_test_abc")
      ).resolves.toBeUndefined();
    });
  });

  describe("listOrders", () => {
    it("returns an empty array when the user has no orders", async () => {
      await expect(listOrders("user-a")).resolves.toEqual([]);
    });

    it("returns only orders for the requested user", async () => {
      await createOrder("user-a", sampleDraft);
      await createOrder("user-b", { total: 50, items: [{ id: "3", quantity: 1 }] });

      const userAOrders = await listOrders("user-a");
      const userBOrders = await listOrders("user-b");

      expect(userAOrders).toHaveLength(1);
      expect(userAOrders[0]?.userId).toBe("user-a");
      expect(userBOrders).toHaveLength(1);
      expect(userBOrders[0]?.userId).toBe("user-b");
    });

    it("returns a shallow copy so callers cannot mutate stored orders", async () => {
      await createOrder("user-a", sampleDraft);

      const orders = await listOrders("user-a");
      orders[0]!.status = "paid";

      const fresh = await listOrders("user-a");
      expect(fresh[0]?.status).toBe("processing");
    });
  });

  describe("markOrderAsPaid", () => {
    it("updates the order status to paid and returns the updated order", async () => {
      const created = await createOrder("user-a", sampleDraft);

      const paid = await markOrderAsPaid("user-a", created.id);

      expect(paid).toMatchObject({
        id: created.id,
        userId: "user-a",
        status: "paid",
      });

      const persisted = await listOrders("user-a");
      expect(persisted[0]?.status).toBe("paid");
    });

    it("returns undefined when the order id does not exist for the user", async () => {
      await createOrder("user-a", sampleDraft);

      await expect(markOrderAsPaid("user-a", "missing-id")).resolves.toBeUndefined();
    });

    it("returns undefined when the order belongs to a different user", async () => {
      const created = await createOrder("user-a", sampleDraft);

      await expect(markOrderAsPaid("user-b", created.id)).resolves.toBeUndefined();

      const orders = await listOrders("user-a");
      expect(orders[0]?.status).toBe("processing");
    });

    it("returns undefined when the order was already cancelled", async () => {
      const created = await createOrder("user-a", sampleDraft);
      await cancelOrder("user-a", created.id);

      await expect(markOrderAsPaid("user-a", created.id)).resolves.toBeUndefined();
    });
  });

  describe("cancelOrder", () => {
    it("cancels a processing order owned by the user", async () => {
      const created = await createOrder("user-a", sampleDraft);

      const result = await cancelOrder("user-a", created.id);

      expect(result).toEqual({
        ok: true,
        order: expect.objectContaining({
          id: created.id,
          status: "cancelled",
        }),
      });

      const listed = await listOrders("user-a");
      expect(listed[0]?.status).toBe("cancelled");
    });

    it("is idempotent when the order is already cancelled", async () => {
      const created = await createOrder("user-a", sampleDraft);
      await cancelOrder("user-a", created.id);

      const again = await cancelOrder("user-a", created.id);

      expect(again).toMatchObject({
        ok: true,
        order: { id: created.id, status: "cancelled" },
      });
    });

    it("rejects cancelling a paid order", async () => {
      const created = await createOrder("user-a", sampleDraft);
      await markOrderAsPaid("user-a", created.id);

      const result = await cancelOrder("user-a", created.id);

      expect(result).toEqual({
        ok: false,
        error: "Paid orders cannot be cancelled from this flow",
      });
    });

    it("returns notFound when the order belongs to another user", async () => {
      const created = await createOrder("user-a", sampleDraft);

      const result = await cancelOrder("user-b", created.id);

      expect(result).toEqual({
        ok: false,
        error: "Order not found",
        notFound: true,
      });
    });
  });

  describe("listAllOrders", () => {
    it("returns all orders across users", async () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("order-a")
        .mockReturnValueOnce("order-b");

      await createOrder("user-a", sampleDraft);
      await createOrder("user-b", { total: 50, items: [{ id: "3", quantity: 1 }] });

      const all = await listAllOrders();

      expect(all).toHaveLength(2);
      expect(all.map((order) => order.userId).sort()).toEqual(["user-a", "user-b"]);
    });

    it("returns an empty array when no orders exist", async () => {
      await expect(listAllOrders()).resolves.toEqual([]);
    });

    it("sorts orders by date descending (newest first)", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-01T10:00:00.000Z"));
      vi.spyOn(crypto, "randomUUID").mockReturnValueOnce("older");

      await createOrder("user-a", sampleDraft);

      vi.setSystemTime(new Date("2024-06-02T10:00:00.000Z"));
      vi.spyOn(crypto, "randomUUID").mockReturnValueOnce("newer");

      await createOrder("user-b", { total: 50, items: [{ id: "3", quantity: 1 }] });

      const all = await listAllOrders();

      expect(all.map((order) => order.id)).toEqual(["newer", "older"]);
    });
  });
});
