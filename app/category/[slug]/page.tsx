"use client";

import React from "react";
import { useParams } from "next/navigation";
import { categoryData } from "@/lib/categoryData";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const data = categoryData[slug];

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
                <Link href="/" className="text-blue-600 hover:underline flex items-center">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 border-l-8 border-blue-600 pl-4">
                        {data.title}
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">Browse Sub-Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.subCategories.map((item, index) => (
                            <Link
                                key={index}
                                href={`/search?q=${encodeURIComponent(item)}`}
                                className="block p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                            >
                                <span className="text-gray-600 group-hover:text-blue-700 font-medium">
                                    {item}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
