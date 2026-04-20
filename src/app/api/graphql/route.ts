import { graphql, buildSchema } from "graphql";
import { listProducts, readProductById } from "@/lib/product-data";
import { createOrder, listOrders } from "@/lib/order-store";
import type { CartItem } from "@/lib/types";

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

const rootValue = {
  products: () => listProducts(),
  product: ({ id }: { id: string }) => readProductById(id),
  orders: () => listOrders(),
  createOrder: ({
    total,
    items,
  }: {
    total: number;
    items: CartItem[];
  }) =>
    createOrder({
      total,
      items,
    }),
};

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

  const result = await graphql({
    schema,
    source: body.query,
    rootValue,
    variableValues: body.variables,
  });

  const status = result.errors?.length ? 400 : 200;
  return Response.json(result, { status });
}
