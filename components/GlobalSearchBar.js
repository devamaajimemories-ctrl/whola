"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Flag to track if the effect is still active (prevents race conditions)
    let isActive = true;

    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const res = await fetch(`/api/global-search?q=${query}`);
          const data = await res.json();
          
          // Only update state if this is still the most recent request
          if (isActive) {
            setResults(data.results || []);
          }
        } catch (error) {
          console.error("Fetch error:", error);
          if (isActive) setResults([]);
        } finally {
          if (isActive) setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // Increased debounce to 500ms to prevent hammering the server

    return () => {
      isActive = false; // Mark this request as stale if user types again
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  const handleSearch = () => {
      if(query.trim()) {
          router.push(`/search?q=${query}`);
          setResults([]); 
      }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
        <span className="pl-4 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </span>
        <input
          type="text"
          className="w-full p-3 outline-none text-gray-700 placeholder-gray-400"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {loading && <span className="pr-4 text-blue-600 text-sm font-medium animate-pulse">Searching...</span>}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto divide-y divide-gray-100">
          {results.map((item, index) => (
            <Link href={item.url} key={index} className="block hover:bg-blue-50 transition-colors" onClick={() => setResults([])}>
              <div className="flex items-center p-3">
                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">IMG</div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.type === 'Product' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'Service' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.subtitle} • {item.location || 'India'}</p>
                </div>
              </div>
            </Link>
          ))}
          <button onClick={handleSearch} className="w-full p-3 text-center text-blue-600 text-sm font-bold hover:bg-gray-50">
              View all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}