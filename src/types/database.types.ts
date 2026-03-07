export interface Profile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
}

export interface Author {
    id: string;
    name: string;
    nationality: string | null;
    bio: string | null;
    created_at: string;
}

export interface LocationNode {
    id: string;
    user_id: string;
    parent_id: string | null;
    level_name: string;
    name: string;
    sort_order: number;
    created_at: string;
    children?: LocationNode[];
    full_path?: string; // Virtual field computed in API
}

export interface Book {
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
    // Joined fields
    author?: Author;
    location?: LocationNode;
    comments?: BookComment[];
}

export interface BookComment {
    id: string;
    book_id: string;
    user_id: string;
    comment: string;
    created_at: string;
}

// Form types
export interface AuthorFormData {
    name: string;
    nationality?: string;
    bio?: string;
}

export interface LocationNodeFormData {
    parent_id?: string | null;
    level_name: string;
    name: string;
    sort_order?: number;
}

export interface BookFormData {
    author_id?: string | null;
    location_node_id?: string | null;
    isbn?: string;
    title: string;
    language?: string;
    rating?: number | null;
    cover_url?: string;
}

export interface BookCommentFormData {
    comment: string;
}
