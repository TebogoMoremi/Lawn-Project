import { describe, expect, it } from "vitest";
import { services, getService } from "./services";
import { areas, getArea } from "./areas";

describe("public catalogue routing", () => {
  it.each(services)("resolves the published service $slug", (service) => {
    expect(getService(service.slug)).toBe(service);
  });
  it.each(areas)("resolves $slug and its linked services", (area) => {
    expect(getArea(area.slug)).toBe(area);
    for (const slug of area.serviceSlugs)
      expect(getService(slug)).toBeDefined();
  });
  it.each([
    "missing",
    "__proto__",
    "constructor",
    "Grass-Cutting",
    "",
    "../benoni",
  ])("rejects unknown slug %s instead of serving unrelated content", (slug) => {
    expect(getService(slug)).toBeUndefined();
    expect(getArea(slug)).toBeUndefined();
  });
});
