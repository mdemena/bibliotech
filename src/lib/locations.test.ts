import { describe, expect, it } from "vitest";
import { buildTree, getLocationPath } from "@/lib/locations";
import type { LocationNode } from "@/types";

function node(id: string, parentId: string | null, name: string): LocationNode {
  return {
    id,
    user_id: "user",
    parent_id: parentId,
    level_name: "Lugar",
    name,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("buildTree", () => {
  it("roots get no children", () => {
    const tree = buildTree([node("a", null, "Casa")]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toEqual([]);
  });

  it("builds hierarchical structure", () => {
    const tree = buildTree([
      node("casa", null, "Casa"),
      node("sala", "casa", "Salón"),
      node("libreria", "sala_erronea", "Librería"),
    ]);
    void tree;
  });

  it("builds nested tree", () => {
    const tree = buildTree([
      node("casa", null, "Casa"),
      node("sala", "casa", "Salón"),
      node("libreria", "sala", "Librería"),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe("Casa");
    expect(tree[0]?.children?.[0]?.name).toBe("Salón");
    expect(tree[0]?.children?.[0]?.children?.[0]?.name).toBe("Librería");
  });
});

describe("getLocationPath", () => {
  it("joins ancestors with arrows", () => {
    const nodes = [
      node("casa", null, "Casa"),
      node("sala", "casa", "Salón"),
      node("libreria", "sala", "Librería"),
    ];
    expect(getLocationPath("libreria", nodes)).toBe("Casa → Salón → Librería");
    expect(getLocationPath("casa", nodes)).toBe("Casa");
  });
});
