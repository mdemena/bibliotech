import { expect, test } from "@playwright/test";

test.describe("landing pública", () => {
  test("redirige al locale por defecto y muestra el hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.title()).resolves.toContain("BiblioTech");
  });
});

test.describe("rutas protegidas", () => {
  test("dashboard sin sesión redirige a login", async ({ page }) => {
    await page.goto("/es/dashboard");
    await expect(page).toHaveURL(/\/es\/login$/);
  });
});
