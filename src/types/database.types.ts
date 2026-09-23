export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      authors: {
        Row: {
          id: string;
          name: string;
          nationality: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nationality?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          nationality?: string | null;
          bio?: string | null;
        };
        Relationships: [];
      };
      location_nodes: {
        Row: {
          id: string;
          user_id: string;
          parent_id: string | null;
          level_name: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          parent_id?: string | null;
          level_name: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          parent_id?: string | null;
          level_name?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "location_nodes_parent_id_fkey",
            columns: ["parent_id"],
            referencedRelation: "location_nodes",
            referencedColumns: ["id"],
          },
        ];
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          author_id: string | null;
          location_node_id: string | null;
          isbn: string | null;
          title: string;
          language: string | null;
          rating: number | null;
          cover_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          author_id?: string | null;
          location_node_id?: string | null;
          isbn?: string | null;
          title: string;
          language?: string | null;
          rating?: number | null;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          location_node_id?: string | null;
          isbn?: string | null;
          title?: string;
          language?: string | null;
          rating?: number | null;
          cover_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey",
            columns: ["author_id"],
            referencedRelation: "authors",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "books_location_node_id_fkey",
            columns: ["location_node_id"],
            referencedRelation: "location_nodes",
            referencedColumns: ["id"],
          },
        ];
      };
      book_comments: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id?: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          comment?: string;
        };
        Relationships: [
          {
            foreignKeyName: "book_comments_book_id_fkey",
            columns: ["book_id"],
            referencedRelation: "books",
            referencedColumns: ["id"],
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          subscription: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          endpoint: string;
          subscription: Json;
        };
        Update: {
          subscription?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      handle_new_user: { Args: Record<string, unknown> | never; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];
