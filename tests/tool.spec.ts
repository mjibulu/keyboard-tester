import { expect, test } from "@playwright/test";
import { createExternalRequestGuard } from "../src/lib/network-guard";

test("keyboard states, details, rollover, and layouts stay local", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Playwright baseURL is required.");
  const networkGuard = createExternalRequestGuard(baseURL);
  page.on("request", (request) => networkGuard.inspect(request.url()));

  await page.goto("/");
  await page.getByRole("button", { name: "Full" }).click();
  await expect(page.getByTitle("Esc · Escape")).toBeVisible();
  await page.getByRole("button", { name: "Start keyboard test" }).click();

  await page.keyboard.down("Shift");
  await page.keyboard.down("a");
  const rollover = page.getByRole("region", { name: "Detected rollover" });
  await expect(rollover.getByText("Held now").locator("..").getByRole("strong")).toHaveText(
    "2",
  );
  const latest = page.getByRole("region", { name: "Latest event" });
  await expect(latest.getByText("KeyA", { exact: true })).toBeVisible();
  await expect(latest.getByText("standard", { exact: true })).toBeVisible();

  await page.keyboard.up("a");
  await page.keyboard.up("Shift");
  await page.keyboard.press("Escape");
  await expect(page.getByText("Keyboard test stopped")).toBeVisible();

  networkGuard.assertNoExternalRequests();
});
