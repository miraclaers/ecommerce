import type { CartItem, Order, OrderDraft, Product } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.error === "string"
        ? payload.error
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${baseUrl}/api/products`);
  const payload = await readJson<{ data: Product[] }>(response);
  return payload.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products/${id}`);
  const payload = await readJson<{ data: Product }>(response);
  return payload.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch(`${baseUrl}/api/orders`);
  const payload = await readJson<{ data: Order[] }>(response);
  return payload.data;
}

export async function postOrder(order: OrderDraft): Promise<Order> {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
  const payload = await readJson<{ data: Order }>(response);
  return payload.data;
}

export async function markOrderPaid(orderId: string): Promise<Order> {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: orderId }),
  });
  const payload = await readJson<{ data: Order }>(response);
  return payload.data;
}

export async function fetchRemoteCart(
  sessionId: string
): Promise<CartItem[]> {
  const response = await fetch(
    `${baseUrl}/api/cart/${encodeURIComponent(sessionId)}`
  );
  const payload = await readJson<{ data: CartItem[] }>(response);
  return payload.data;
}

export async function syncRemoteCart(
  sessionId: string,
  items: CartItem[]
): Promise<CartItem[]> {
  const response = await fetch(
    `${baseUrl}/api/cart/${encodeURIComponent(sessionId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    }
  );
  const payload = await readJson<{ data: CartItem[] }>(response);
  return payload.data;
}

export async function createOrderWithGraphQL(
  order: OrderDraft
): Promise<Order> {
  const response = await fetch(`${baseUrl}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
    }),
  });
  const payload = await readJson<{
    data?: { createOrder?: Order };
    errors?: Array<{ message?: string }>;
  }>(response);

  if (payload.errors?.length || !payload.data?.createOrder) {
    throw new Error(payload.errors?.[0]?.message ?? "GraphQL request failed");
  }
  return payload.data.createOrder;
}
