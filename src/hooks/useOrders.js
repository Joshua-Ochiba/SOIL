import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Fetch all orders (admin) ─────────────────────────────────────────────────
export function useAdminOrders() {
    return useQuery({
        queryKey: ['admin-orders'],
        queryFn:  async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ── Create order (called from success page) ──────────────────────────────────
export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (order) => {
            const { data, error } = await supabase
                .from('orders')
                .insert([order])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    });
}

// ── Update order status / notes (admin) ──────────────────────────────────────
export function useUpdateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...fields }) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ ...fields, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    });
}
