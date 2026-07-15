import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Public mutation — anyone can subscribe ────────────────────────────────
export function useSubscribeNewsletter() {
    return useMutation({
        mutationFn: async ({ email, source }) => {
            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
                throw new Error('Please enter a valid email address.');
            }

            // No Supabase configured (local dev without env) → pretend success
            if (!isSupabaseConfigured) return { email: cleanEmail, mocked: true };

            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: cleanEmail, source: source || null }]);

            // Already subscribed → treat as soft success (don't expose internals)
            if (error) {
                if (error.code === '23505' /* unique violation */) {
                    return { email: cleanEmail, alreadySubscribed: true };
                }
                throw new Error(error.message || 'Could not save your email.');
            }

            return { email: cleanEmail };
        },
    });
}

// ── Admin query — list all subscribers ────────────────────────────────────
export function useNewsletterSubscribers() {
    return useQuery({
        queryKey: ['newsletter-subscribers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ── Admin mutation — remove a subscriber ──────────────────────────────────
export function useDeleteSubscriber() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['newsletter-subscribers'] }),
    });
}
