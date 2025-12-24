'use client'; // Required for Next.js App Router

import { useState, useEffect, useRef, useCallback } from 'react';

export default function InfiniteProductFeed() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for the "observer" element at the bottom
  const observerTarget = useRef(null);

  // 1. Function to fetch data
  const fetchProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/get-products?page=${page}`);
      
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();

      setProducts((prev) => [...prev, ...data.products]); // Append new items to list
      setHasMore(data.hasMore);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  // 2. Trigger fetch when 'page' number updates
  useEffect(() => {
    fetchProducts();
  }, [page]);

  // 3. The "ExportIndia" Magic: Detect scroll to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          // User hit the bottom -> Increase page number
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 } // Trigger when the loading div is fully visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Latest Products</h2>

      {/* PRODUCT LIST */}
      <div className="space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border p-4 rounded shadow-sm hover:shadow-md transition bg-white"
          >
            <h3 className="text-xl font-semibold text-blue-800">{product.name}</h3>
            <p className="text-gray-600">Price: ₹{product.price}</p>
            <p className="text-sm text-gray-500">{product.description}</p>
            <button className="mt-2 bg-yellow-400 px-4 py-1 text-sm font-bold rounded">
              Contact Supplier
            </button>
          </div>
        ))}
      </div>

      {/* LOADER / TRIGGER ELEMENT */}
      {/* This invisible div sits at the bottom. When you scroll to it, the Observer fires. */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-4">
        {isLoading && (
          <p className="text-gray-500 font-semibold animate-pulse">
            Loading more results...
          </p>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-gray-400">No more products found.</p>
        )}
      </div>
    </div>
  );
}