import { supabase } from '../lib/supabaseClient';
import type { Author, AuthorFormData } from '../types/database.types';

export const authorsApi = {
    async getAll(): Promise<Author[]> {
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .order('name');

        if (error) throw error;
        return data ?? [];
    },

    async getById(id: string): Promise<Author> {
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(author: AuthorFormData): Promise<Author> {
        const { data, error } = await supabase
            .from('authors')
            .insert(author)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, author: Partial<AuthorFormData>): Promise<Author> {
        const { data, error } = await supabase
            .from('authors')
            .update(author)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('authors')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async search(query: string): Promise<Author[]> {
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('name');

        if (error) throw error;
        return data ?? [];
    },
};
