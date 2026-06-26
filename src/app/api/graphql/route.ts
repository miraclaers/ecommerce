import { graphql, buildSchema } from "graphql";
import { getUserIdSafe } from "@/lib/auth";
import { listProducts, readProductById } from "@/lib/product-data";
import { createOrder, listOrders } from "@/lib/order-store";
import { validateGraphQLQuery } from "@/lib/graphql-guard";
import { computeOrderTotal } from "@/lib/order-pricing";
import type { CartItem } from "@/lib/types";
import {
  isValidCart,
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
    createOrder(total: Float!, items: [CartItemInput!]!): Order!
  }
`);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    variables?: Record<string, unknown>;
  };

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
    }: {
      total: number;
      items: CartItem[];
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
