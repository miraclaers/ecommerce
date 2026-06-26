import { expect, test } from "@playwright/test";

test("browse product, add to cart, and complete checkout", async ({ page }) => {
  await page.goto("/product/1");
  await page.getByRole("button", { name: "Add to cart" }).first().click();

  // Wait for the "Added to cart" confirmation so React has committed the cart
  // update (and its localStorage persistence effect) before the hard navigation
  // below. Without this, a fast goto can outrun the write and land on an empty
  // cart, making "Proceed to checkout" never appear.
  await expect(page.getByRole("status")).toHaveText("Added to cart");

  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Proceed to checkout" })).toBeVisible();
  await page.getByRole("link", { name: "Proceed to checkout" }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await page.getByRole("link", { name: "Pay now" }).click();

  await expect(page.getByRole("heading", { name: "Review and pay" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm payment" }).click();

  await expect(page).toHaveURL(/\/checkout\/success/);
  await expect(
    page.getByRole("heading", { name: "Order completed" })
  ).toBeVisible({ timeout: 15_000 });
});
