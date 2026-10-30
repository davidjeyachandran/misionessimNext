import { expect, test, type Page, type Request } from "@playwright/test";

/**
 * The "Da el paso" signup (app/hermosos-pies/SignupForm.tsx) only renders the
 * real two-step form when NEXT_PUBLIC_HERMOSOS_PIES_ENDPOINT is set. That value
 * is inlined at build time, so it is the served page — not this process's env —
 * that decides whether there is anything to test. Formspree itself is mocked.
 */
const PAGE = "http://localhost:3000/hermosos-pies/";
const GRACIAS = "http://localhost:3000/hermosos-pies/gracias/";

async function formIsConfigured(page: Page) {
  return (await page.locator("form[action*='formspree.io']").count()) > 0;
}

/** Answer every Formspree POST with success and record the JSON bodies. */
async function mockFormspree(page: Page) {
  const bodies: Record<string, string>[] = [];
  await page.route("**/formspree.io/**", async (route) => {
    bodies.push(JSON.parse((route.request() as Request).postData() ?? "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  return bodies;
}

async function completeStepOne(page: Page) {
  await page.getByLabel("Nombre:").fill("Ana Pérez");
  await page.getByLabel("Correo:").fill("ana@example.com");
  await page.getByRole("checkbox", { name: /Acepto recibir noticias/ }).check();
  await page.getByRole("button", { name: "Quiero dar el paso" }).click();
}

test.describe("Hermosos Pies signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    test.skip(!(await formIsConfigured(page)), "NEXT_PUBLIC_HERMOSOS_PIES_ENDPOINT is not set");
  });

  test("step 1 needs a name, email and consent", async ({ page }) => {
    const form = page.locator("form[action*='formspree.io']");
    await expect(form.locator("a[href='/privacidad/']")).toBeVisible();
    expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(false);
  });

  test("step 1 saves the lead before showing the optional step 2", async ({ page }) => {
    const bodies = await mockFormspree(page);
    await completeStepOne(page);

    const heading = page.getByRole("heading", { name: "¡Gracias, Ana Pérez!" });
    await expect(heading).toBeFocused();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({
      nombre: "Ana Pérez",
      email: "ana@example.com",
      consentimiento: "sí",
      etapa: "1",
    });
    expect(bodies[0]).not.toHaveProperty("_next");
    expect(bodies[0]).not.toHaveProperty("_gotcha");
  });

  test("step 2 sends the extras with the same email, then lands on gracias", async ({ page }) => {
    const bodies = await mockFormspree(page);
    await completeStepOne(page);

    await page.getByText("Orar por pies que sirven con SIM").click();
    await page.getByText("Dar para pies que sirven con SIM").click();
    await page.getByLabel("País:").selectOption("México");
    // The dial code is filled in for the pinned countries.
    await expect(page.getByLabel("WhatsApp:")).toHaveValue("+52 ");
    await page.getByLabel("WhatsApp:").fill("+52 55 1234 5678");
    await page.getByText("Miembro de la iglesia").click();
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.waitForURL(GRACIAS);
    expect(bodies).toHaveLength(2);
    expect(bodies[1]).toMatchObject({
      nombre: "Ana Pérez",
      email: "ana@example.com",
      etapa: "2",
      quiero: "Orar por pies que sirven con SIM; Dar para pies que sirven con SIM",
      pais: "México",
      whatsapp: "+52 55 1234 5678",
      rol: "Miembro de la iglesia",
    });
  });

  test("a bare dial code is not sent as a WhatsApp number", async ({ page }) => {
    const bodies = await mockFormspree(page);
    await completeStepOne(page);

    await page.getByLabel("País:").selectOption("Perú");
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.waitForURL(GRACIAS);
    expect(bodies[1]).toMatchObject({ pais: "Perú", whatsapp: "" });
  });

  test("Saltar, or sending step 2 empty, skips the second submission", async ({ page }) => {
    const bodies = await mockFormspree(page);
    await completeStepOne(page);
    await page.getByRole("button", { name: "Enviar" }).click();

    await page.waitForURL(GRACIAS);
    expect(bodies).toHaveLength(1);

    await page.goto(PAGE);
    await completeStepOne(page);
    await page.getByRole("link", { name: "Saltar" }).click();
    await page.waitForURL(GRACIAS);
    expect(bodies).toHaveLength(2);
    expect(bodies.every((b) => b.etapa === "1")).toBe(true);
  });

  test("degrades to a native POST that redirects to gracias without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    let body: string | null = null;
    await page.route("**/formspree.io/**", async (route) => {
      body = route.request().postData();
      await route.fulfill({ status: 303, headers: { location: GRACIAS }, body: "" });
    });

    await page.goto(PAGE, { waitUntil: "domcontentloaded" });
    const form = page.locator("form[action*='formspree.io']");
    await expect(form).toHaveAttribute("method", /post/i);
    await expect(form.locator("input[name=_next]")).toHaveValue(/\/hermosos-pies\/gracias\/$/);

    await form.locator("#chsp-nombre").fill("Sin JavaScript");
    await form.locator("#chsp-correo").fill("nojs@example.com");
    await form.locator("input[name=consentimiento]").check();
    await form.locator("button[type=submit]").click();

    await page.waitForURL(GRACIAS);
    expect(body).toContain("nombre=Sin+JavaScript");
    expect(body).toContain("etapa=1");
    await ctx.close();
  });
});

test.describe("Hermosos Pies gracias page", () => {
  test("offers both WhatsApp invites and every social profile", async ({ page }) => {
    await page.goto(GRACIAS);

    await expect(page.locator("main h1")).toHaveText("¡Gracias por dar el paso!");
    await expect(page.getByRole("link", { name: /Únete a Oportunidades SIM/ })).toHaveAttribute(
      "href",
      "https://chat.whatsapp.com/FfwZVyN09pA49SpPhyITWd",
    );
    await expect(page.getByRole("link", { name: /Sigue el canal SIM Latinoamérica/ })).toHaveAttribute(
      "href",
      "https://whatsapp.com/channel/0029Vb5w2PzJUM2hE0Ci061b",
    );
    await expect(page.getByRole("link", { name: /Descarga la guía de oración/ })).toHaveAttribute(
      "href",
      "https://movilicemos.org/sites/default/files/recursos/2026/Devocional-HermososPies-SIM_2026.pdf",
    );
    for (const name of ["Facebook", "Instagram", "Spotify", "YouTube"]) {
      await expect(page.locator("main").getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("has no horizontal scroll on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(GRACIAS);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
