import { supabase } from '../lib/supabaseClient';
import type { LocationNode, LocationNodeFormData } from '../types/database.types';

export const locationsApi = {
    async getAll(): Promise<LocationNode[]> {
        const { data, error } = await supabase
            .from('location_nodes')
            .select('*')
            .order('sort_order')
            .order('name');

        if (error) throw error;
        return data ?? [];
    },

    async getTree(): Promise<LocationNode[]> {
        const allNodes = await this.getAll();
        return buildTree(allNodes);
    },

    async getById(id: string): Promise<LocationNode> {
        const { data, error } = await supabase
            .from('location_nodes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(node: LocationNodeFormData): Promise<LocationNode> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('location_nodes')
            .insert({ ...node, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, node: Partial<LocationNodeFormData>): Promise<LocationNode> {
        const { data, error } = await supabase
            .from('location_nodes')
            .update(node)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('location_nodes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// Build tree structure from flat list
function buildTree(nodes: LocationNode[]): LocationNode[] {
    const map = new Map<string, LocationNode>();
    const roots: LocationNode[] = [];

    // First pass: create map entries with empty children
    nodes.forEach((node) => {
        map.set(node.id, { ...node, children: [] });
    });

    // Second pass: build parent-child relationships
    nodes.forEach((node) => {
        const treeNode = map.get(node.id)!;
        if (node.parent_id && map.has(node.parent_id)) {
            map.get(node.parent_id)!.children!.push(treeNode);
        } else {
            roots.push(treeNode);
        }
    });

    return roots;
}

// Flatten tree to get full path for display
export function getLocationPath(nodeId: string, allNodes: LocationNode[]): string {
    const map = new Map<string, LocationNode>();
    allNodes.forEach((n) => map.set(n.id, n));

    const parts: string[] = [];
    let current = map.get(nodeId);

    while (current) {
        parts.unshift(current.name);
        current = current.parent_id ? map.get(current.parent_id) : undefined;
    }

    return parts.join(' → ');
}
