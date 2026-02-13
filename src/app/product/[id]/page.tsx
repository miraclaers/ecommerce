"use client";

import { notFound, useParams } from "next/navigation";
import { getProductById, getProducts } from "@/lib/products";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "shipping" | "reviews"
  >("description");

  if (!id) {
    notFound();
  }

  const product = getProductById(id);
  if (!product) {
    notFound();
  }

  const relatedProducts = getProducts().filter(
    (p) => p.id !== product.id
  );

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-16">
      {/* Top section */}
      <section className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="border-4 border-violet-600 rounded-xl overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <p className="text-2xl text-violet-600 font-semibold mt-4">
            ${product.price}
          </p>

          <button
            onClick={() => {
              addToCart(product.id);
              setAdded(true);
            }}
            className="mt-8 bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition"
          >
            Add to cart
          </button>

          {added && (
            <p className="mt-4 text-green-600">
              Product added to cart
            </p>
          )}

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b">
              {["description", "shipping", "reviews"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab as typeof activeTab
                      )
                    }
                    className={`pb-2 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-violet-600 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab content */}
            <div className="mt-6 text-gray-600 text-sm">
              {activeTab === "description" && (
                <p>
                  {product.description} Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
              )}

              {activeTab === "shipping" && (
                <ul className="space-y-2">
                  <li>Free shipping over $100</li>
                  <li>30-day returns</li>
                  <li>1-year warranty</li>
                </ul>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div>
                    5/5 - <strong>Ana</strong>
                    <p>
                      Great quality, exceeded my expectations.
                    </p>
                  </div>
                  <div>
                    4/5 - <strong>Lucas</strong>
                    <p>
                      Very good product, fast delivery.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          Related products
        </h2>

        <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-2">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      </section>
    </main>
  );
}
