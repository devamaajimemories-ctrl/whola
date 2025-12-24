import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers'; // Import these
import { getSearchResults } from '@/lib/search-logic';
import SearchHistory from '@/lib/models/SearchHistory'; // Import Model
import { verifyToken } from '@/lib/auth'; // Import Auth check

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get('q') || '';
  const location = searchParams.get('loc') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const verified = searchParams.get('verified') === 'true';
  const topRated = searchParams.get('topRated') === 'true';
  const openNow = searchParams.get('openNow') === 'true';

  if (!query) {
      return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
  }

  // --- LOGGING START ---
  // We log asynchronously so it doesn't block the search results significantly
  const logSearch = async () => {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        
        // Check if user is logged in
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        let userId = undefined;
        
        if (token) {
            const payload = await verifyToken(token);
            if (payload && typeof payload === 'object' && 'userId' in payload) {
                userId = payload.userId as string;
            }
        }

        await SearchHistory.create({
            query,
            location, // Save location
            ip,
            userId
        });
    } catch (e) {
        console.error("Failed to log search:", e);
    }
  };
  
  // Await logging to ensure it runs in serverless environment
  await logSearch(); 
  // --- LOGGING END ---

  try {
    const { products, hasMore } = await getSearchResults(query, location, page, {
        verified, 
        topRated, 
        openNow
    });

    return NextResponse.json({
      success: true,
      products,
      hasMore,
      page
    });

  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}