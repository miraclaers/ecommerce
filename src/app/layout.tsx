import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/app/context/CartContext";
import { OrdersProvider } from "@/app/context/OrdersContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <OrdersProvider>
            <Header />
            {children}
          </OrdersProvider>
        </CartProvider>
      </body>
    </html>
  );
}
