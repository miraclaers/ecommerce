import type { CartItem, Order, OrderDraft, Product } from "@/lib/types";
import { AppError } from "@/lib/errors";
import { request } from "@/lib/http-client";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function fetchProducts(): Promise<Product[]> {
  const payload = await request<{ data: Product[] }>(`${baseUrl}/api/products`);
  return payload.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const payload = await request<{ data: Product }>(
    `${baseUrl}/api/products/${id}`
  );
  return payload.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const payload = await request<{ data: Order[] }>(`${baseUrl}/api/orders`);
  return payload.data;
}

export async function postOrder(order: OrderDraft): Promise<Order> {
  const payload = await request<{ data: Order }>(`${baseUrl}/api/orders`, {
    method: "POST",
    body: order,
  });
  return payload.data;
}

export async function markOrderPaid(orderId: string): Promise<Order> {
  const payload = await request<{ data: Order }>(`${baseUrl}/api/orders`, {
    method: "PATCH",
    body: { id: orderId },
  });
  return payload.data;
}

export async function fetchRemoteCart(
  sessionId: string
): Promise<CartItem[]> {
  const payload = await request<{ data: CartItem[] }>(
    `${baseUrl}/api/cart/${encodeURIComponent(sessionId)}`
  );
  return payload.data;
}

export async function syncRemoteCart(
  sessionId: string,
  items: CartItem[]
): Promise<CartItem[]> {
  const payload = await request<{ data: CartItem[] }>(
    `${baseUrl}/api/cart/${encodeURIComponent(sessionId)}`,
    {
      method: "PUT",
      body: { items },
    }
  );
  return payload.data;
}

export async function createOrderWithGraphQL(
  order: OrderDraft
): Promise<Order> {
  const payload = await request<{
    data?: { createOrder?: Order };
    errors?: Array<{ message?: string }>;
  }>(`${baseUrl}/api/graphql`, {
    method: "POST",
    body: {
      query: `
        mutation CreateOrder($total: Float!, $items: [CartItemInput!]!) {
          createOrder(total: $total, items: $items) {
            id
            total
            date
            status
            items {
              id
              quantity
            }
          }
        }
      `,
      variables: order,
    },
  });

  if (payload.errors?.length || !payload.data?.createOrder) {
    throw new AppError(
      payload.errors?.[0]?.message ?? "GraphQL request failed",
      { code: "HTTP" }
    );
  }
  return payload.data.createOrder;
}
