import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PRODUCTS } from '@/data/products';

// ── Public store hook (falls back to static data if Supabase not configured) ──
export function useProducts(category = null) {
    return useQuery({
        queryKey: ['products', category],
        queryFn: async () => {
            if (!isSupabaseConfigured) {
                return category ? PRODUCTS.filter(p => p.category === category) : PRODUCTS;
            }
            let query = supabase
                .from('products')
                .select('*')
                .eq('in_stock', true)
                .order('created_at', { ascending: false });
            if (category) query = query.eq('category', category);
            const { data, error } = await query;
            if (error) throw error;
            return data.map(fromDb);
        },
        staleTime: 1000 * 60 * 5,
    });
}

// ── Admin hook — returns ALL products including out-of-stock ─────────────────
export function useAdminProducts() {
    return useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(fromDb);
        },
        enabled: isSupabaseConfigured,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (product) => {
            const { data, error } = await supabase
                .from('products')
                .insert([toDb(product)])
                .select()
                .single();
            if (error) throw error;
            return fromDb(data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...product }) => {
            const { data, error } = await supabase
                .from('products')
                .update({ ...toDb(product), updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return fromDb(data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
}

// ── Mappers ──────────────────────────────────────────────────────────────────
function fromDb(row) {
    return {
        id:               row.id,
        name:             row.name,
        category:         row.category,
        // Base price is Naira. price_usd is an optional explicit USD override.
        price:            Number(row.price),
        priceUsd:         row.price_usd == null || row.price_usd === '' ? null : Number(row.price_usd),
        description:      row.description || '',
        details:          row.details || [],
        sizes:            row.sizes || [],
        image:            row.image || '',
        inStock:          row.in_stock,
        // null = unlimited stock; integer = tracked count
        stockCount:       row.stock_count == null ? null : Number(row.stock_count),
        featured:         row.featured,
        tag:              row.tag || null,
        createdAt:        row.created_at,
    };
}

function toDb(p) {
    return {
        name:               p.name,
        category:           p.category,
        price:              p.price,
        price_usd:          p.priceUsd === '' || p.priceUsd == null ? null : Number(p.priceUsd),
        description:        p.description  || '',
        details:            p.details      || [],
        sizes:              p.sizes        || [],
        image:              p.image        || '',
        in_stock:           p.inStock      ?? true,
        // Pass through null explicitly so Duke can switch back to unlimited
        stock_count:        p.stockCount === '' || p.stockCount == null ? null : Number(p.stockCount),
        featured:           p.featured     ?? false,
        tag:                p.tag          || null,
    };
}
