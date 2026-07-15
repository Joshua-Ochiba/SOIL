import { QueryClient } from "@tanstack/react-query";

// We create a central caching engine for the entire app.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // If a component asks for data it already fetched 1 minute ago, 
            // don't fetch it again. Just show the cached version instantly.
            staleTime: 60 * 1000, // 1 minute
            // Retry once on transient network failures — prevents false negatives
            // on flaky connections without hammering a genuinely broken endpoint
            retry: 1,
            retryDelay: 1500,
        },
    },
});
