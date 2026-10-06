import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import sharp from "sharp";
import { preparePhotos } from "./photos";
import { storagePath, LocalStorageProvider } from "../storage/local";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const limits = { maxFiles: 5, maxFileBytes: 1048576 };
describe("private photo storage", () => {
  it("decodes a real image, strips metadata and writes a random private key", async () => {
    const source = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "green" },
    })
      .withMetadata()
      .jpeg()
      .toBuffer();
    const [photo] = await preparePhotos(
      [
        new File([new Uint8Array(source)], "garden.jpg", {
          type: "image/jpeg",
        }),
      ],
      limits,
    );
    const metadata = await sharp(photo.bytes).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
    const root = await mkdtemp(join(tmpdir(), "lawnflow-test-"));
    try {
      const storage = new LocalStorageProvider(root);
      const key = await storage.put(photo.bytes);
      expect(key).toMatch(/^[a-f0-9-]{36}\.webp$/);
      expect(await readFile(storagePath(root, key))).toEqual(photo.bytes);
      await storage.remove(key);
      await expect(readFile(storagePath(root, key))).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  it("rejects forged image bytes", async () => {
    await expect(
      preparePhotos(
        [new File(["<svg>unsafe</svg>"], "garden.jpg", { type: "image/jpeg" })],
        limits,
      ),
    ).rejects.toThrow("could not be read safely");
  });
  it("rejects a MIME type that disagrees with decoded content", async () => {
    const png = await sharp({
      create: { width: 1, height: 1, channels: 3, background: "green" },
    })
      .png()
      .toBuffer();
    await expect(
      preparePhotos(
        [new File([new Uint8Array(png)], "garden.jpg", { type: "image/jpeg" })],
        limits,
      ),
    ).rejects.toThrow();
  });
  it.each(["../secret.webp", "C:\\secret.webp", "file.svg", "..\\secret.webp"])(
    "rejects path traversal %s",
    (key) => {
      expect(() => storagePath(tmpdir(), key)).toThrow();
    },
  );
});
