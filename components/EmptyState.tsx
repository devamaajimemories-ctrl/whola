'use client'; 

import React from 'react';
import Link from 'next/link';
import { Search, Megaphone, ArrowRight } from 'lucide-react';

export default function EmptyState() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm max-w-3xl mx-auto my-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-blue-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                We are curating the best suppliers for this category
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
                Our directory is currently being updated with verified wholesalers. 
                <br />
                <strong>Don't wait!</strong> Post your requirement now, and our team will manually connect you with offline suppliers within 4 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                    href="/post-requirement" 
                    className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:bg-red-700 transition-transform hover:-translate-y-1"
                >
                    <Megaphone size={20} className="mr-2"/> Post Buy Requirement
                </Link>
                
                <Link 
                    href="/search" 
                    className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                    Browse Other Categories
                </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center text-sm text-gray-500">
                <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Sourcing Team Active
                </p>
            </div>
        </div>
    );
}