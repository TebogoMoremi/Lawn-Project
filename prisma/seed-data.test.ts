import { describe, expect, it } from "vitest";
import { serviceSeedData, areaSeedData } from "./seed-data";

describe("reference seed consistency", () => {
  it("has unique upsert keys and resolves every area's service relation", () => {
    const slugs = new Set(serviceSeedData.map((service) => service.slug));
    expect(slugs.size).toBe(8);
    expect(serviceSeedData).toHaveLength(8);
    expect(new Set(areaSeedData.map((area) => area.slug)).size).toBe(3);
    for (const area of areaSeedData) {
      expect(area.serviceSlugs.length).toBeGreaterThan(0);
      for (const slug of area.serviceSlugs) expect(slugs.has(slug)).toBe(true);
    }
  });
});
