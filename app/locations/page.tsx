import React from 'react';
import Link from 'next/link';
import { TARGET_CITIES, toSlug } from '@/lib/locations';
import { MapPin } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Service Locations - YouthBharat WholesaleMart',
    description: 'Find wholesale suppliers and manufacturers in all major cities across India.',
};

export default function LocationsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Coverage Areas</h1>
                    <p className="text-lg text-gray-600">
                        Explore verified suppliers and business listings across {TARGET_CITIES.length}+ cities in India.
                    </p>
                </div>

                {/* Cities Grid */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {TARGET_CITIES.sort().map((city, index) => (
                            <Link 
                                key={index}
                                // Links to the broad search page for that city
                                href={`/search?q=Wholesalers%20in%20${city}`}
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                            >
                                <MapPin size={16} className="text-gray-400 shrink-0" />
                                <span className="text-sm font-medium">{city}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SEO Footer Text */}
                <div className="mt-12 text-center max-w-3xl mx-auto text-gray-500 text-sm">
                    <p>
                        YouthBharat connects buyers with suppliers in all major industrial hubs including 
                        {TARGET_CITIES.slice(0, 5).join(', ')} and many more. 
                        Click on a city above to find local manufacturers, dealers, and service providers.
                    </p>
                </div>

            </div>
        </main>
    );
}