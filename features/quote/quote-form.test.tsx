// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteForm } from "./quote-form";
import { testService } from "./test-data";
const { replace, refresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  sessionStorage.clear();
});
const limits = { maxFiles: 5, maxFileBytes: 5 * 1048576 };
it("focuses an error summary for invalid contact details", async () => {
  const user = userEvent.setup();
  render(<QuoteForm services={[testService]} limits={limits} />);
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("alert")).toBe(document.activeElement);
  expect(
    screen
      .getByRole("textbox", { name: "First name" })
      .getAttribute("aria-invalid"),
  ).toBe("true");
});
it("preserves steps, requires consent, retries with the same token and clears on success", async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Try again shortly." }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ location: "/quote/success" }),
    });
  vi.stubGlobal("fetch", fetchMock);
  render(<QuoteForm services={[testService]} limits={limits} />);
  for (const [name, value] of [
    ["First name", "Tebogo"],
    ["Last name", "Example"],
    ["Email", "customer@example.test"],
    ["Mobile number", "082 123 4567"],
  ])
    await user.type(screen.getByRole("textbox", { name }), value);
  const next = () => user.click(screen.getByRole("button", { name: "Next" }));
  await next();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(
    (screen.getByRole("textbox", { name: "First name" }) as HTMLInputElement)
      .value,
  ).toBe("Tebogo");
  await next();
  for (const [name, value] of [
    ["Address line 1", "12 Test Street"],
    ["Suburb", "Test suburb"],
    ["City", "Benoni"],
    ["Province", "Gauteng"],
    ["Postal code", "1501"],
  ])
    await user.type(screen.getByRole("textbox", { name }), value);
  await next();
  await next();
  expect(screen.getByRole("alert").textContent).toContain(
    "Select at least one service",
  );
  await user.click(screen.getByRole("checkbox", { name: /Grass cutting/ }));
  await next();
  await next();
  await next();
  await next();
  const consent = screen.getByRole("checkbox");
  expect((consent as HTMLInputElement).checked).toBe(false);
  await user.click(
    screen.getByRole("button", { name: "Submit quote request" }),
  );
  expect(fetchMock).not.toHaveBeenCalled();
  await user.click(consent);
  await user.click(
    screen.getByRole("button", { name: "Submit quote request" }),
  );
  expect(screen.getByRole("alert").textContent).toContain("Try again");
  await user.click(
    screen.getByRole("button", { name: "Submit quote request" }),
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/quote/success"));
  const payloads = fetchMock.mock.calls.map((call) =>
    JSON.parse((call[1].body as FormData).get("payload") as string),
  );
  expect(payloads[0].token).toMatch(/^[a-f0-9]{64}$/);
  expect(payloads[1].token).toBe(payloads[0].token);
  expect(payloads[0].request.phone).toBe("+27821234567");
  expect(sessionStorage.getItem("lawnflow-quote-attempt")).toBeNull();
  expect(screen.queryByRole("textbox")).toBeNull();
});
