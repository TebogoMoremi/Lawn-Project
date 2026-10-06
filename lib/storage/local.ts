import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

export interface StorageService {
  put(bytes: Buffer): Promise<string>;
  remove(key: string): Promise<void>;
}
export function storagePath(root: string, key: string) {
  if (!/^[a-f0-9-]{36}\.webp$/.test(key))
    throw new Error("Invalid storage key.");
  const base = resolve(root);
  const target = resolve(base, key);
  if (!target.startsWith(base + sep)) throw new Error("Invalid storage key.");
  return target;
}
export class LocalStorageProvider implements StorageService {
  constructor(
    private readonly root = process.env.LOCAL_UPLOAD_DIR ||
      resolve(process.cwd(), ".local", "quote-uploads"),
  ) {}
  async put(bytes: Buffer) {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const key = `${randomUUID()}.webp`;
    const target = storagePath(this.root, key);
    try {
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST")
        await unlink(target).catch(() => {});
      throw error;
    }
    return key;
  }
  async remove(key: string) {
    await unlink(storagePath(this.root, key)).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      },
    );
  }
}
