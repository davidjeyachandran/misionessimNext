import { expect, test } from "@playwright/test";

// "El carácter determinará mi influencia" is article 4 of the 24 in the March
// 2024 edition "Soy influencer" — a real VAMOS article with neighbours on both
// sides. "Camino de generosidad" belongs to no edition.
const IN_EDITION = "/blog/2024-03/el-caracter-determinara-mi-influencia/";
const STANDALONE = "/blog/2024-05/camino-de-generosidad/";

const band = "section[aria-label^='Edición']";
const steps = "nav[aria-label^='Artículo anterior']";

test("an edition article carries its edition, its place in it and its neighbours", async ({
  page,
}) => {
  await page.goto(`http://localhost:3000${IN_EDITION}`);

  const edition = page.locator(band);
  await expect(edition).toBeVisible();
  await expect(edition.getByRole("heading", { name: "Soy influencer" })).toBeVisible();
  await expect(edition.getByText("Artículo 4 de 24 en esta edición")).toBeVisible();
  await expect(edition.getByRole("link", { name: "Ver la edición" })).toHaveAttribute(
    "href",
    "/revistavamos/soy-influencer/",
  );

  // One tick per article, filled up to the current one.
  await expect(edition.locator("div.flex.gap-\\[3px\\] > div")).toHaveCount(24);

  const links = page.locator(`${steps} a`);
  await expect(links).toHaveCount(2);
  await expect(links.first()).toContainText("Anterior en esta edición");
  await expect(links.nth(1)).toContainText("Siguiente en esta edición");

  // The neighbours are the articles either side by date within the edition,
  // not the blog at large.
  await expect(links.first()).toHaveAttribute(
    "href",
    "/blog/2024-03/influenciador-o-influenciado/",
  );
  await expect(links.nth(1)).toHaveAttribute(
    "href",
    "/blog/2024-03/no-siempre-es-un-camino-sencillo/",
  );

  const further = page.getByRole("heading", { name: "Sigue leyendo esta edición" });
  await expect(further).toBeVisible();
  await expect(page.locator("main section", { has: further }).locator("article")).toHaveCount(3);
});

test("the edition page lists the same articles in the same order", async ({ page }) => {
  await page.goto(`http://localhost:3000${IN_EDITION}`);
  await page.locator(band).getByRole("link", { name: "Ver la edición" }).click();

  await expect(page).toHaveURL(/\/revistavamos\/soy-influencer\/$/);
  const articles = page.locator("main article");
  await expect(articles).toHaveCount(24);
  // Article 4 of the running order is the one we came from.
  await expect(articles.nth(3).getByRole("link").first()).toHaveAttribute("href", IN_EDITION);
});

test("an article outside any edition steps through the blog instead", async ({ page }) => {
  await page.goto(`http://localhost:3000${STANDALONE}`);

  await expect(page.locator(band)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Sigue leyendo esta edición" })).toHaveCount(0);

  const links = page.locator(`${steps} a`);
  await expect(links.first()).toContainText("Anterior en el blog");
  await expect(links.nth(1)).toContainText("Siguiente en el blog");
});
