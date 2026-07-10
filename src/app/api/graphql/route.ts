import { graphql, buildSchema } from "graphql";
import { getUserIdSafe } from "@/lib/auth";
import { listProducts, readProductById } from "@/lib/product-data";
import { createOrder, createOrderWithIdempotency, listOrders } from "@/lib/order-store";
import { validateGraphQLQuery } from "@/lib/graphql-guard";
import { computeOrderTotal } from "@/lib/order-pricing";
import type { CartItem } from "@/lib/types";
import {
  isValidCart,
  isValidIdempotencyKey,
  isValidProductId,
  isValidTotal,
} from "@/lib/validate";

const schema = buildSchema(`
  type Product {
    id: ID!
    title: String!
    price: Float!
    description: String!
    image: String!
    category: String!
    createdAt: String!
    popularity: Int!
    rating: Float!
    discountPercent: Int
  }

  type CartItem {
    id: ID!
    quantity: Int!
  }

  input CartItemInput {
    id: ID!
    quantity: Int!
  }

  type Order {
    id: ID!
    total: Float!
    date: String!
    status: String
    items: [CartItem!]!
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
    orders: [Order!]!
  }

  type Mutation {
    createOrder(total: Float!, items: [CartItemInput!]!, idempotencyKey: String): Order!
  }
`);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    variables?: Record<string, unknown>;
  };
  const headerIdempotencyKey =
    request.headers.get("Idempotency-Key")?.trim() ?? null;

  if (!body.query) {
    return Response.json(
      { errors: [{ message: "Missing GraphQL query" }] },
      { status: 400 }
    );
  }

  const queryError = validateGraphQLQuery(body.query);
  if (queryError) {
    return Response.json(
      { errors: [{ message: queryError }] },
      { status: 400 }
    );
  }

  const userId = await getUserIdSafe();

  const rootValue = {
    products: () => listProducts(),
    product: ({ id }: { id: string }) => {
      if (!isValidProductId(id)) {
        return null;
      }
      return readProductById(id);
    },
    orders: async () => (userId ? await listOrders(userId) : []),
    createOrder: async ({
      total,
      items,
      idempotencyKey,
    }: {
      total: number;
      items: CartItem[];
      idempotencyKey?: string | null;
    }) => {
      if (!userId) {
        throw new Error("Unauthorized");
      }
      if (!isValidCart(items)) {
        throw new Error("Invalid order payload");
      }

      const verifiedTotal = computeOrderTotal(items);
      if (verifiedTotal === null || !isValidTotal(total)) {
        throw new Error("Invalid order payload");
      }
      if (total !== verifiedTotal) {
        throw new Error("Order total does not match catalog prices");
      }

      const key =
        (typeof idempotencyKey === "string" && idempotencyKey.trim()) ||
        headerIdempotencyKey;

      if (key) {
        if (!isValidIdempotencyKey(key)) {
          throw new Error("Invalid Idempotency-Key");
        }
        const { order } = await createOrderWithIdempotency(
          userId,
          { total: verifiedTotal, items },
          key
        );
        return order;
      }

      return createOrder(userId, { total: verifiedTotal, items });
    },
  };

  const result = await graphql({
    schema,
    source: body.query,
    rootValue,
    variableValues: body.variables,
  });

  const status = result.errors?.length ? 400 : 200;
  return Response.json(result, { status });
}
