import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Session timeout config ────────────────────────────────────────────────────
const SESSION_SHORT_MS = 2  * 60 * 60 * 1000;       // 2 hours  (no remember me)
const SESSION_LONG_MS  = 30 * 24 * 60 * 60 * 1000;  // 30 days  (remember me)
const META_KEY = 'soil_admin_session_meta';

function saveSessionMeta(rememberMe) {
    localStorage.setItem(META_KEY, JSON.stringify({
        loginAt:    Date.now(),
        rememberMe: !!rememberMe,
    }));
}

function clearSessionMeta() {
    localStorage.removeItem(META_KEY);
}

function isSessionExpired() {
    try {
        const raw = localStorage.getItem(META_KEY);
        if (!raw) return true;
        const { loginAt, rememberMe } = JSON.parse(raw);
        const limit = rememberMe ? SESSION_LONG_MS : SESSION_SHORT_MS;
        return Date.now() - loginAt > limit;
    } catch {
        return true;
    }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        // Initial session check — enforces our custom timeout on restored sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user && isSessionExpired()) {
                supabase.auth.signOut();
                clearSessionMeta();
                setUser(null);
            } else {
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                // Fresh login — saveSessionMeta() hasn't been called yet at this point
                // (it's called after signInWithPassword resolves, but onAuthStateChange
                // fires first). Trust the event unconditionally; expiry is enforced
                // on next page load via getSession() above.
                setUser(session?.user ?? null);
                return;
            }

            // For INITIAL_SESSION, TOKEN_REFRESHED, etc. — enforce our custom timeout
            if (session?.user && isSessionExpired()) {
                supabase.auth.signOut();
                clearSessionMeta();
                setUser(null);
            } else {
                setUser(session?.user ?? null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password, rememberMe = false) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) {
            // Save meta AFTER confirmation so the timestamp is accurate
            saveSessionMeta(rememberMe);
        }
        return result;
    };

    const signOut = async () => {
        clearSessionMeta();
        return supabase.auth.signOut();
    };

    return { user, loading, signIn, signOut };
}
