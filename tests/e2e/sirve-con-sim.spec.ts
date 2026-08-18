import { expect, test } from "@playwright/test";

/**
 * The enquiry form only renders when NEXT_PUBLIC_CONTACT_ENDPOINT is set (see
 * app/sirve-con-sim/ContactForm.tsx). That value is inlined into the bundle at
 * build time, so it is the served page — not this process's env — that decides
 * whether there is a form to test.
 */
async function formIsConfigured(page: import("@playwright/test").Page) {
  return (await page.locator("main form").count()) > 0;
}

test.describe("Sirve con SIM", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/sirve-con-sim/");
  });

  test("keeps live's section order with a single h1", async ({ page }) => {
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveText("¡Hay lugar para ti en SIM!");

    // Live marks the band heading up as an <h3> under the hero's <h1> and the
    // Requisitos heading up as a second <h1>; both are h2 here.
    await expect(page.locator("main h2")).toContainText([
      /Existen más de 800 puestos/,
      /Escríbenos para iniciar la conversación/,
      /Tu iglesia te envía/,
      /al servicio del movimiento misionero latino/,
      /Requisitos para servir con SIM/,
    ]);
  });

  test("lists all ten requisitos without live's trailing colons", async ({ page }) => {
    // The enquiry form contributes two h3s of its own ("Datos" and
    // "Comentario o consulta"); count only the requisito cards.
    const items = page.locator("main section h3", { hasText: /./ }).filter({
      hasNotText: /^(Datos|Comentario o consulta)$/,
    });
    await expect(page.getByRole("heading", { level: 3, name: "Relación con Dios" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Proceso de candidato" })).toBeVisible();
    expect(await items.count()).toBeGreaterThanOrEqual(10);
  });

  test("gives each requisito live's own icon", async ({ page }) => {
    const badges = page.locator("main ul li > span:has(svg)");
    await expect(badges).toHaveCount(10);

    // Live draws a different icon per requisito; a repeated one would mean
    // the artwork got flattened back to a single generic glyph.
    const shapes = await badges.locator("svg").evaluateAll((svgs) =>
      svgs.map((svg) => svg.innerHTML),
    );
    expect(new Set(shapes).size).toBe(10);

    // Decorative — the term beside each icon already names it.
    await expect(badges.locator("svg[aria-hidden='true']")).toHaveCount(10);
  });

  test("uses the same contact address as the footer", async ({ page }) => {
    await expect(
      page.locator("main a[href='mailto:sim.preguntas@sim.org']").first(),
    ).toBeVisible();
    await expect(page.locator("main a[href*='info@misionessim.org']")).toHaveCount(0);
  });

  test("offers email and WhatsApp regardless of the form", async ({ page }) => {
    await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://chat.whatsapp.com/FfwZVyN09pA49SpPhyITWd",
    );
  });

  test("does not load the YouTube iframe until the video is opened", async ({ page }) => {
    await expect(page.locator(".lightbox-video iframe")).toHaveCount(0);

    await page.getByRole("button", { name: /Ver Video/ }).click();

    await expect(page.locator(".lightbox-video iframe")).toHaveAttribute(
      "src",
      /youtube\.com\/embed\/zx8x6J7vPNI/,
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".lightbox-video iframe")).toHaveCount(0);
  });

  test("gives every image real alt text", async ({ page }) => {
    // Live ships the band photo with alt="" though it carries the section's
    // meaning, and paints the iglesia photo as a CSS background.
    const alts = await page.locator("main img").evaluateAll((imgs) =>
      imgs.map((i) => ({ src: (i as HTMLImageElement).src, alt: i.getAttribute("alt") })),
    );
    const content = alts.filter((a) => !a.src.includes("/ico-"));
    expect(content.length).toBeGreaterThanOrEqual(3);
    for (const img of content) expect(img.alt?.length ?? 0).toBeGreaterThan(10);
  });

  test.describe("enquiry form", () => {
    test.beforeEach(async ({ page }) => {
      test.skip(!(await formIsConfigured(page)), "NEXT_PUBLIC_CONTACT_ENDPOINT is not set");
    });

    test("labels every field and requires consent before submitting", async ({ page }) => {
      const form = page.locator("main form");
      await expect(form.getByLabel(/Nombre y apellido/)).toBeVisible();
      await expect(form.getByLabel(/Teléfono/)).toBeVisible();
      await expect(form.getByLabel(/^Email/)).toBeVisible();
      await expect(form.getByLabel(/^País/)).toBeVisible();
      await expect(form.getByLabel(/Comentario o consulta/)).toBeVisible();

      // Live's consent checkbox links to href="#"; ours has a real page.
      await expect(form.locator("a[href='/privacidad/']")).toBeVisible();

      expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(false);
    });

    test("never posts when the honeypot is filled", async ({ page }) => {
      let posted = 0;
      await page.route("**/*", (route) => {
        if (route.request().method() === "POST") posted += 1;
        return route.continue();
      });

      const form = page.locator("main form");

      // Web3Forms' own honeypot must be a checkbox with this exact name, and
      // is what guards the endpoint against bots that skip our JavaScript.
      await expect(form.locator("input[name=botcheck]")).toHaveAttribute("type", "checkbox");

      await form.getByLabel(/Nombre y apellido/).fill("Bot");
      await form.getByLabel(/Teléfono/).fill("000");
      await form.getByLabel(/^Email/).fill("bot@example.com");
      await form.getByLabel(/^País/).selectOption("Chile");
      await form.getByRole("checkbox").check();
      await form.locator("[name=website]").fill("http://spam.example", { force: true });
      await form.getByRole("button", { name: "Enviar" }).click();

      await expect(page.locator("main").getByRole("status")).toBeVisible();
      expect(posted).toBe(0);

    });

    test("degrades to a native POST when JavaScript never runs", async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false });
      const page = await ctx.newPage();
      let native: { method: string; contentType?: string; body: string | null } | null = null;
      await page.route("**/api.web3forms.com/**", async (route) => {
        native = {
          method: route.request().method(),
          contentType: route.request().headers()["content-type"],
          body: route.request().postData(),
        };
        await route.fulfill({
          status: 303,
          headers: { location: "http://localhost:3000/sirve-con-sim/gracias/" },
          body: "",
        });
      });

      await page.goto("http://localhost:3000/sirve-con-sim/", { waitUntil: "domcontentloaded" });
      const form = page.locator("main form");
      // Without these the form is inert with JS off: there is no `action` for
      // the browser to post to.
      await expect(form).toHaveAttribute("action", /web3forms\.com|formspree\.io/);
      await expect(form).toHaveAttribute("method", /post/i);
      for (const name of ["access_key", "subject", "from_name", "redirect"]) {
        await expect(form.locator(`input[type=hidden][name=${name}]`)).toHaveCount(1);
      }

      await form.locator("#contact-name").fill("Sin JavaScript");
      await form.locator("#contact-phone").fill("+51 999 111 222");
      await form.locator("#contact-email").fill("nojs@example.com");
      await form.locator("#contact-country").selectOption("Perú");
      await form.locator("#contact-consent").check();
      await form.locator("button[type=submit]").click();

      await page.waitForURL("**/gracias/");
      await expect(page.locator("main h1")).toHaveText("¡Gracias por escribirnos!");
      expect(native!.method).toBe("POST");
      expect(native!.contentType).toContain("application/x-www-form-urlencoded");
      expect(native!.body).toContain("nombre=Sin+JavaScript");
      await ctx.close();
    });

    test("does not also fire the native POST when JavaScript is available", async ({ page }) => {
      let json = 0;
      let formEncoded = 0;
      await page.route("**/api.web3forms.com/**", async (route) => {
        const ct = route.request().headers()["content-type"] ?? "";
        if (ct.includes("application/json")) json += 1;
        else formEncoded += 1;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      const form = page.locator("main form");
      await form.getByLabel(/Nombre y apellido/).fill("Con JavaScript");
      await form.getByLabel(/Teléfono/).fill("1");
      await form.getByLabel(/^Email/).fill("js@example.com");
      await form.getByLabel(/^País/).selectOption("Chile");
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Enviar" }).click();
      await expect(page.locator("main").getByRole("status")).toBeVisible();

      expect({ json, formEncoded }).toEqual({ json: 1, formEncoded: 0 });
      expect(new URL(page.url()).pathname).toBe("/sirve-con-sim/");
    });

    test("sends the field names and reserved keys the endpoint expects", async ({ page }) => {
      let payload: Record<string, unknown> | null = null;
      await page.route("**/api.web3forms.com/**", async (route) => {
        payload = JSON.parse(route.request().postData() ?? "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      const form = page.locator("main form");
      await form.getByLabel(/Nombre y apellido/).fill("María Pérez");
      await form.getByLabel(/Teléfono/).fill("+56 9 8765 4321");
      await form.getByLabel(/^Email/).fill("maria@example.com");
      await form.getByLabel(/^País/).selectOption("Chile");
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Enviar" }).click();
      await expect(page.locator("main").getByRole("status")).toBeVisible();

      // Web3Forms takes the field literally named `email` as the Reply-To, so
      // renaming it would silently break replying to enquirers.
      expect(payload).toMatchObject({
        email: "maria@example.com",
        nombre: "María Pérez",
        subject: expect.any(String),
        from_name: expect.any(String),
      });
      // Our own honeypot is enforced in the browser and never transmitted;
      // theirs is only sent when a bot ticks it.
      expect(payload).not.toHaveProperty("website");
      expect(payload).not.toHaveProperty("botcheck");
      // Only the no-JS path uses `redirect`; Web3Forms ignores it for JSON.
      expect(payload).not.toHaveProperty("redirect");
    });

    test("treats a 200 carrying success:false as a failure", async ({ page }) => {
      await page.route("**/api.web3forms.com/**", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: false, message: "Invalid access key" }),
        }),
      );

      const form = page.locator("main form");
      await form.getByLabel(/Nombre y apellido/).fill("Prueba");
      await form.getByLabel(/Teléfono/).fill("123");
      await form.getByLabel(/^Email/).fill("prueba@example.com");
      await form.getByLabel(/^País/).selectOption("Perú");
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Enviar" }).click();

      await expect(form.getByRole("alert")).toContainText(/No pudimos enviar tu consulta/);
    });

    test("keeps the form and explains the failure when the endpoint errors", async ({ page }) => {
      await page.route("**/api.web3forms.com/**", (route) => route.fulfill({ status: 500 }));
      await page.route("**/formspree.io/**", (route) => route.fulfill({ status: 500 }));

      const form = page.locator("main form");
      await form.getByLabel(/Nombre y apellido/).fill("Prueba");
      await form.getByLabel(/Teléfono/).fill("123");
      await form.getByLabel(/^Email/).fill("prueba@example.com");
      await form.getByLabel(/^País/).selectOption("Perú");
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Enviar" }).click();

      // Scoped to the form: Next ships its own role="alert" route announcer.
      await expect(form.getByRole("alert")).toContainText(/No pudimos enviar tu consulta/);
      await expect(form.getByRole("button", { name: "Enviar" })).toBeEnabled();
    });
  });
});
