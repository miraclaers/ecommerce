import { NextResponse } from "next/server";
import { listProducts } from "@/lib/product-data";
import { getJson, setJson } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const cacheKey = category
    ? `products:category:${category}`
    : "products:all";
  const cached = await getJson<ReturnType<typeof listProducts>>(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, source: "redis" });
  }

  const products = listProducts();
  const data = category
    ? products.filter((product) => product.category === category)
    : products;
  await setJson(cacheKey, data, 60 * 5);

  return NextResponse.json({ data });
}
