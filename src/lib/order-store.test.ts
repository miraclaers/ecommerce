import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderDraft } from "@/lib/types";

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
          createdAt,
          items,
        };
        prismaStore.orders.push(order);
        return order;
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
          results.sort((a, b) => {
            const byDate = b.createdAt.getTime() - a.createdAt.getTime();
            if (byDate !== 0) {
              return byDate;
            }
            return (
              prismaStore.orders.indexOf(b) - prismaStore.orders.indexOf(a)
            );
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
        where?: { id?: string; userId?: string };
      }) => {
        const order = prismaStore.orders.find(
          (candidate) =>
            (!where?.id || candidate.id === where.id) &&
            (!where?.userId || candidate.userId === where.userId)
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
    },
  },
}));

import {
  createOrder,
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
