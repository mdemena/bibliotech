import type { LocationNode } from "@/types";

export function buildTree(nodes: LocationNode[]): LocationNode[] {
  const map = new Map<string, LocationNode>();
  const roots: LocationNode[] = [];

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const current = map.get(node.id);
    if (!current) continue;
    const parent = node.parent_id ? map.get(node.parent_id) : undefined;
    if (parent) {
      parent.children!.push(current);
    } else {
      roots.push(current);
    }
  }

  return roots;
}

export function getLocationPath(nodeId: string, allNodes: LocationNode[]): string {
  const map = new Map(allNodes.map((n) => [n.id, n]));

  const parts: string[] = [];
  let current = map.get(nodeId);

  while (current) {
    parts.unshift(current.name);
    current = current.parent_id ? map.get(current.parent_id) : undefined;
  }

  return parts.join(" → ");
}
