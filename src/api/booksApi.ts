import { supabase } from '../lib/supabaseClient';
import type { Book, BookFormData } from '../types/database.types';

export const booksApi = {
    getAll: async (): Promise<Book[]> => {
        const { data, error } = await supabase
            .from('books')
            .select(`
        *,
        author:authors(*),
        location:location_nodes(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((b: any) => ({
            ...b,
            location: b.location
        }));
    },

    getById: async (id: string): Promise<Book> => {
        const { data, error } = await supabase
            .from('books')
            .select(`
        *,
        author:authors(*),
        location:location_nodes(*),
        comments:book_comments(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (data.comments) {
            data.comments.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        }

        return {
            ...data,
            location: data.location
        };
    },

    create: async (book: BookFormData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('books')
            .insert([{ ...book, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (id: string, book: Partial<BookFormData>) => {
        const { data, error } = await supabase
            .from('books')
            .update(book)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (id: string) => {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    addComment: async (bookId: string, content: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('book_comments')
            .insert([{
                book_id: bookId,
                user_id: user.id,
                comment: content
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteComment: async (commentId: string) => {
        const { error } = await supabase
            .from('book_comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    }
};
