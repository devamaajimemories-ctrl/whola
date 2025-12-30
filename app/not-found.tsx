import Link from 'next/link';
import { industrialProducts } from '@/lib/industrialData';

export default function NotFound() {
  // Get random suggestions to keep user engaged
  const suggestedCategories = industrialProducts
        .flatMap(c => c.products)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center border border-gray-100">
        <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The product, company, or market you are looking for does not exist or has been removed.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-blue-900 mb-4">You might be interested in:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {suggestedCategories.map((cat, i) => (
                    <Link 
                        key={i} 
                        href={`/find/${cat.replace(/\s+/g, '-').toLowerCase()}-in-india`}
                        className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        {cat}
                    </Link>
                ))}
            </div>
        </div>

        <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}