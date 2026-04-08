import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabaseClient';
import React from 'react';

// Help component to consume the auth context
const AuthConsumer = () => {
    const { user, loading } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? 'authenticated' : 'no-user'}</div>
            <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('updates loading state correctly when session is found', async () => {
        // Mock getSession to return a session
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: '123' } } },
            error: null,
        });

        // Mock onAuthStateChange
        (supabase.auth.onAuthStateChange as any).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        // Should start with loading
        expect(screen.getByTestId('loading')).toHaveTextContent('loading');

        // Should eventually transition to ready and authenticated
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            expect(screen.getByTestId('user')).toHaveTextContent('authenticated');
        });
    });

    it('remains in loading state if URL has code parameter but getSession returns null', async () => {
        // Mock URL with code parameter
        delete (window as any).location;
        (window as any).location = new URL('http://localhost:5173/auth/callback?code=123');

        // Mock getSession to return null (initially, before exchange)
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: null },
            error: null,
        });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        // Should be loading because of 'code' in URL
        expect(screen.getByTestId('loading')).toHaveTextContent('loading');

        // Wait some time to ensure it doesn't flip to 'ready' prematurely
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(screen.getByTestId('loading')).toHaveTextContent('loading');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('sets loading to false once onAuthStateChange fires SIGNED_IN', async () => {
        delete (window as any).location;
        (window as any).location = new URL('http://localhost:5173/auth/callback?code=123');

        // Mock getSession to return null
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: null },
            error: null,
        });

        let authChangeListener: any;
        (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
            authChangeListener = callback;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        // Initial check
        expect(screen.getByTestId('loading')).toHaveTextContent('loading');

        // Simulate SIGNED_IN event from Supabase
        await waitFor(() => expect(authChangeListener).toBeDefined());

        authChangeListener('SIGNED_IN', { user: { id: '456' } });

        // Now it should be ready and authenticated
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            expect(screen.getByTestId('user')).toHaveTextContent('authenticated');
        });
    });
});
