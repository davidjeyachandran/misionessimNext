import { expect, test } from "@playwright/test";

const CARD_IMAGES = [
  { src: "/home/foto-sim2_.webp", alt: "Sirve en la misión" },
  { src: "/home/foto-da.webp", alt: "Da para la misión" },
  { src: "/home/foto-ora.webp", alt: "Ora por la misión" },
];

test("home mission card images do not emit Next.js aspect-ratio warnings", async ({
  page,
}) => {
  const imageWarnings: string[] = [];

  page.on("console", (message) => {
    const text = message.text();

    if (
      message.type() === "warning" &&
      CARD_IMAGES.some(({ src }) => text.includes(src)) &&
      text.includes("has either width or height modified")
    ) {
      imageWarnings.push(text);
    }
  });

  await page.goto("http://localhost:3000/");

  for (const { alt } of CARD_IMAGES) {
    const image = page.getByAltText(alt);
    const media = page.locator(".card-media").filter({ has: image });

    await expect(media).toBeVisible();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
      .toBe(true);

    const mediaBox = await media.boundingBox();
    const imageBox = await image.boundingBox();
    const objectFit = await image.evaluate((element) => getComputedStyle(element).objectFit);

    expect(Math.round(mediaBox?.height ?? 0)).toBe(220);
    expect(Math.abs((imageBox?.width ?? 0) - (mediaBox?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((imageBox?.height ?? 0) - (mediaBox?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(objectFit).toBe("cover");
  }

  expect(imageWarnings).toEqual([]);
});
