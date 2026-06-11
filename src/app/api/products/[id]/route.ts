import { NextResponse } from "next/server";
import { readProductById } from "@/lib/product-data";
import { isValidProductId } from "@/lib/validate";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidProductId(id)) {
    return NextResponse.json(
      { error: "Invalid product id" },
      { status: 400 }
    );
  }

  const product = readProductById(id);

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: product });
}
