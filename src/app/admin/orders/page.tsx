import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listAllOrders } from "@/lib/order-store";
import type { UserRole } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function AdminOrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin/orders");
  }

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as UserRole | undefined) ?? "user";

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Admin access required
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Set <code className="text-xs">publicMetadata.role</code> to{" "}
          <code className="text-xs">admin</code> in Clerk for this user.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block text-sm font-medium text-violet-600 hover:underline"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  const orders = await listAllOrders();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Admin — all orders
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        SSR page protected by Clerk middleware and role check.
      </p>
      {orders.length === 0 ? (
        <p className="mt-8 text-zinc-500">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(order.total)} — {order.status}
              </p>
              <p className="text-xs text-zinc-500">
                User {order.userId.slice(0, 8)}… · {order.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
