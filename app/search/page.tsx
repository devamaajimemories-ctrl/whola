import React from 'react';
import { getSearchResults } from '@/lib/search-logic';
import SearchInterface from '@/components/SearchInterface';

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ 
    q: string; 
    loc?: string; 
    verified?: string; 
    topRated?: string; 
    openNow?: string; 
}>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const query = params.q || "";
    const location = params.loc || "";
    
    // Parse filters
    const filters = {
        verified: params.verified === 'true',
        topRated: params.topRated === 'true',
        openNow: params.openNow === 'true'
    };

    // SSR Fetch with filters
    const { products } = await getSearchResults(query, location, 1, filters);

    return (
        <main>
            <SearchInterface 
                key={`${query}-${location}-${JSON.stringify(filters)}`} 
                initialQuery={query}
                initialLocation={location}
                initialData={products} 
                initialFilters={filters} // Pass initial state to client
            />
        </main>
    );
}