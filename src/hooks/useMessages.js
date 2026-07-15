import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Fetch all contact submissions (admin) ─────────────────────────────────────
export function useAdminMessages() {
    return useQuery({
        queryKey: ['admin-messages'],
        queryFn:  async () => {
            const { data, error } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}
