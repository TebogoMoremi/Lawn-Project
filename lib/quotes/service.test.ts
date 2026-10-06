import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { PrismaClient, Prisma } from "../../generated/prisma/client";
import { createQuoteSubmission, hashToken } from "./service";
import { submissionSchema } from "../../features/quote/validation";
import { validDraft, testService } from "../../features/quote/test-data";
const input = { request: validDraft, token: "a".repeat(64) };
function setup() {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ locked: true }]),
    quote: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
    customer: { create: vi.fn().mockResolvedValue({ id: "customer" }) },
    address: { create: vi.fn().mockResolvedValue({ id: "address" }) },
    service: { findMany: vi.fn().mockResolvedValue([testService]) },
  };
  const db = {
    quote: { findUnique: vi.fn().mockResolvedValue(null) },
    quoteReferenceCounter: {
      upsert: vi.fn().mockResolvedValue({ year: 2026, lastValue: BigInt(1) }),
    },
    $transaction: vi.fn(
      async (fn: (client: Prisma.TransactionClient) => Promise<unknown>) =>
        fn(tx as unknown as Prisma.TransactionClient),
    ),
  };
  const storage = {
    put: vi.fn().mockResolvedValue("safe.webp"),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const deps = {
    db: db as unknown as PrismaClient,
    storage,
    now: new Date("2026-10-06T10:00:00Z"),
  };
  return { tx, db, storage, deps };
}
describe("quote creation orchestration (mocked transaction, not PostgreSQL integration)", () => {
  it("creates customer, owned address, items and initial history inside one transaction without prices", async () => {
    const { tx, db, deps } = setup();
    const receipt = await createQuoteSubmission(input, [], deps);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.customer.create).toHaveBeenCalledWith({
      data: {
        firstName: "Tebogo",
        lastName: "Example",
        email: "customer@example.test",
        phone: "+27821234567",
      },
    });
    expect(tx.address.create.mock.calls[0][0].data.customerId).toBe("customer");
    const data = tx.quote.create.mock.calls[0][0].data;
    expect(data.status).toBe("QUOTE_REQUESTED");
    expect(data.statusHistory.create.status).toBe("QUOTE_REQUESTED");
    expect(data.items.create[0].serviceId).toBe(testService.id);
    expect(data.finalPrice).toBeUndefined();
    expect(data.lawnSize).toBeUndefined();
    expect(data.frequency).toBeNull();
    expect(data.submissionTokenHash).not.toBe(input.token);
    expect(receipt.reference).toBe("LF-2026-000001");
  });
  it("rejects inactive or nonexistent services before creating customer/files", async () => {
    const { tx, deps, storage } = setup();
    tx.service.findMany.mockResolvedValue([]);
    await expect(createQuoteSubmission(input, [], deps)).rejects.toThrow(
      "no longer available",
    );
    expect(tx.customer.create).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });
  it("replays an identical retry without new records or counters", async () => {
    const { db, deps } = setup();
    const request = submissionSchema.parse(input).request;
    db.quote.findUnique.mockResolvedValue({
      reference: "LF-2026-000010",
      submissionDigest: hashToken(JSON.stringify({ request, photos: [] })),
      receiptExpiresAt: new Date("2026-10-07T10:00:00Z"),
    });
    expect((await createQuoteSubmission(input, [], deps)).reference).toBe(
      "LF-2026-000010",
    );
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.quoteReferenceCounter.upsert).not.toHaveBeenCalled();
    await expect(
      createQuoteSubmission(
        { ...input, request: { ...validDraft, notes: "Changed" } },
        [],
        deps,
      ),
    ).rejects.toThrow("different details");
  });
  it("cleans staged photos after a known upload failure", async () => {
    const { storage, deps, tx } = setup();
    storage.put
      .mockResolvedValueOnce("first.webp")
      .mockRejectedValueOnce(new Error("disk full"));
    const photo = {
      bytes: Buffer.from("test"),
      digest: "digest",
      mimeType: "image/webp" as const,
    };
    await expect(
      createQuoteSubmission(input, [photo, photo], deps),
    ).rejects.toThrow("could not be stored");
    expect(storage.remove).toHaveBeenCalledWith("first.webp");
    expect(tx.quote.create).not.toHaveBeenCalled();
  });
  it("retains photos when commit outcome is ambiguous", async () => {
    const { tx, storage, deps } = setup();
    tx.quote.create.mockRejectedValue(new Error("connection lost"));
    await expect(
      createQuoteSubmission(
        input,
        [{ bytes: Buffer.from("test"), digest: "x", mimeType: "image/webp" }],
        deps,
      ),
    ).rejects.toThrow();
    expect(storage.remove).not.toHaveBeenCalled();
  });
  it("bounds retries for unique reference conflicts", async () => {
    const { tx, db, deps } = setup();
    tx.quote.create.mockRejectedValue({ code: "P2002" });
    await expect(createQuoteSubmission(input, [], deps)).rejects.toThrow(
      "allocate",
    );
    expect(db.quoteReferenceCounter.upsert).toHaveBeenCalledTimes(3);
  });
});
