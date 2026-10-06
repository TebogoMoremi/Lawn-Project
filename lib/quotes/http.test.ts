import { expect, it, vi } from "vitest";
import { boundedFormData } from "./http";
import { SubmissionLimiter } from "./rate-limit";
it("releases a stalled upload after the body deadline", async () => {
  vi.useFakeTimers();
  try {
    const body = new ReadableStream<Uint8Array>({ start() {} });
    const request = new Request("http://localhost", {
      method: "POST",
      body,
      headers: { "content-type": "multipart/form-data; boundary=test" },
      duplex: "half",
    } as RequestInit);
    const result = expect(boundedFormData(request, 1000)).rejects.toMatchObject(
      { status: 408 },
    );
    await vi.advanceTimersByTimeAsync(30000);
    await result;
  } finally {
    vi.useRealTimers();
  }
});
it("reads multipart and bounds actual bytes without Content-Length", async () => {
  const form = new FormData();
  form.set("payload", "test");
  const request = new Request("http://localhost", {
    method: "POST",
    body: form,
  });
  expect((await boundedFormData(request.clone(), 10000)).get("payload")).toBe(
    "test",
  );
  await expect(boundedFormData(request, 2)).rejects.toThrow("too large");
});
it("rejects oversized declared length and unsupported content", async () => {
  await expect(
    boundedFormData(
      new Request("http://localhost", { method: "POST", body: "text" }),
      100,
    ),
  ).rejects.toThrow("quote form");
  await expect(
    boundedFormData(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=x",
          "content-length": "9999",
        },
        body: "text",
      }),
      100,
    ),
  ).rejects.toThrow("too large");
});
it("limits parallel requests and rate windows with idempotent release", () => {
  const limiter = new SubmissionLimiter();
  const first = limiter.enter(1)!;
  const second = limiter.enter(1)!;
  const third = limiter.enter(1)!;
  expect(limiter.enter(1)).toBeNull();
  first();
  first();
  second();
  third();
  for (let i = 0; i < 27; i++) limiter.enter(2)!();
  expect(limiter.enter(2)).toBeNull();
  expect(limiter.enter(60001)).not.toBeNull();
});
