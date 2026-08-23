import { expect, test } from "@playwright/test";

test("home exposes one main landmark", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(page.getByRole("main")).toHaveCount(1);
});

test("home section headings descend from the page heading", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "SIM es una comunidad de seguidores de Dios",
    }),
  ).toBeVisible();
});

test("home blog image links expose their article titles", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const cards = page.locator("article.post");
  await expect(cards).toHaveCount(3);

  for (const card of await cards.all()) {
    const title = (await card.getByRole("heading", { level: 3 }).innerText()).trim();
    await expect(card.locator("a.post-media")).toHaveAccessibleName(
      new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});

test("home does not advertise an unavailable search action", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(page.getByRole("button", { name: "Buscar" })).toHaveCount(0);
});

const POSTS_WITH_EMBEDDED_LEVEL_ONE_HEADINGS = [
  "/blog/2025-06/10-cualidades-de-un-discipulador/",
  "/blog/2025-12/la-mision-es-en-equipo-10-razones-para-unirte-a-una-agencia-misionera/",
];

for (const route of POSTS_WITH_EMBEDDED_LEVEL_ONE_HEADINGS) {
  test(`${route} keeps one page heading`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
}

test("embedded video markup hydrates without invalid HTML errors", async ({ page }) => {
  const markupErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|cannot be a descendant|cannot contain/i.test(message.text())
    ) {
      markupErrors.push(message.text());
    }
  });

  await page.goto(
    "http://localhost:3000/blog/2025-12/la-mision-es-en-equipo-10-razones-para-unirte-a-una-agencia-misionera/",
  );

  await expect(page.locator("iframe[title='Video']")).toHaveCount(1);
  expect(markupErrors).toEqual([]);
});
