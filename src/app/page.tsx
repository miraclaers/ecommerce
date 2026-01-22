import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-8 py-20 text-center">
      <h1 className="text-4xl font-bold">
        Mini Ecommerce
      </h1>

      <p className="mt-4 text-lg text-gray-600">
        A simple demo store built with Next.js, TypeScript and Context API.
      </p>

      <div className="mt-10">
        <Link
          href="/products"
          className="inline-block bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition"
        >
          View Products
        </Link>
      </div>
    </main>
  );
}
