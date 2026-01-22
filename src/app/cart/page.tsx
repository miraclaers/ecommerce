"use client";
import Link from "next/link";
import Image from "next/image"
import { useCart } from "../context/CartContext";
import { getProductById } from "@/lib/products";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    clearCart,
  } = useCart();

  const cartItemsWithData = cart
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);

  const total = cartItemsWithData.reduce(
    (acc, item) => acc + item!.subtotal,
    0
  );

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Cart
      </h1>

      {cartItemsWithData.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItemsWithData.map((item) => (
              <li
                key={item!.id}
                className="border rounded-xl p-4 flex gap-4 items-start"
              >
                {/* Image placeholder */}
                <Image
                src={item!.image}
                alt={item!.title}
                width={80}
                height={80}
                className="rounded-lg object-cover shrink-0"
                />

                {/* Product info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {item!.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {item!.description}
                  </p>

                  {/* Quantity & actions */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="font-semibold">
                      Quantity: {item!.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item!.id)
                      }
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(item!.id)
                      }
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="mt-2 font-semibold">
                    Subtotal: ${item!.subtotal}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="
                px-4 py-2
                border border-red-300
                text-red-600
                rounded-lg
                hover:bg-red-50
                hover:border-red-400
                transition
              "
            >
              Clear cart
            </button>

            <p className="text-xl font-bold">
              Total: ${total}
            </p>
            <Link
  href="/checkout"
  className="
    px-6 py-3
    bg-violet-600 text-white
    rounded-lg
    hover:bg-violet-700
    transition
  "
>
  Proceed to checkout
</Link>

          </div>
        </>
      )}
    </main>
  );
}
