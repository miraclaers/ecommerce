import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "./CartContext";

function TestComponent() {
  const { cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  const qty = cart.find((item) => item.id === "p1")?.quantity ?? 0;

  return (
    <div>
      <p data-testid="qty">{qty}</p>

      <button onClick={() => addToCart("p1")}>add</button>
      <button onClick={() => increaseQuantity("p1")}>plus</button>
      <button onClick={() => decreaseQuantity("p1")}>minus</button>
      <button onClick={() => removeFromCart("p1")}>remove</button>
    </div>
  );
}

describe("CartContext integration", () => {
  it("updates quantity through UI actions", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("qty")).toHaveTextContent("0");

    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");

    await user.click(screen.getByText("plus"));
    expect(screen.getByTestId("qty")).toHaveTextContent("2");

    await user.click(screen.getByText("minus"));
    expect(screen.getByTestId("qty")).toHaveTextContent("1");

    await user.click(screen.getByText("remove"));
    expect(screen.getByTestId("qty")).toHaveTextContent("0");
  });
});