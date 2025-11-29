"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Verified, MapPin, MessageCircle, Crosshair } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import ChatModal from "@/components/ChatModal";

const POPULAR_CITIES = [
    "All India",
    "Delhi, Delhi", "New Delhi, Delhi", "Noida, Uttar Pradesh", "Gurgaon, Haryana", "Ghaziabad, Uttar Pradesh", "Faridabad, Haryana", "Chandigarh, Punjab",
    "Ludhiana, Punjab", "Amritsar, Punjab", "Jalandhar, Punjab", "Patiala, Punjab",
    "Jaipur, Rajasthan", "Jodhpur, Rajasthan", "Kota, Rajasthan", "Udaipur, Rajasthan", "Bikaner, Rajasthan",
    "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Agra, Uttar Pradesh", "Varanasi, Uttar Pradesh", "Meerut, Uttar Pradesh", "Prayagraj, Uttar Pradesh", "Bareilly, Uttar Pradesh", "Aligarh, Uttar Pradesh",
    "Dehradun, Uttarakhand", "Haridwar, Uttarakhand", "Jammu, Jammu & Kashmir", "Srinagar, Jammu & Kashmir", "Shimla, Himachal Pradesh",
    "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra", "Nashik, Maharashtra", "Thane, Maharashtra", "Aurangabad, Maharashtra", "Solapur, Maharashtra", "Kolhapur, Maharashtra",
    "Ahmedabad, Gujarat", "Surat, Gujarat", "Vadodara, Gujarat", "Rajkot, Gujarat", "Gandhinagar, Gujarat", "Bhavnagar, Gujarat", "Jamnagar, Gujarat",
    "Indore, Madhya Pradesh", "Bhopal, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Jabalpur, Madhya Pradesh", "Ujjain, Madhya Pradesh",
    "Panaji, Goa",
    "Bangalore, Karnataka", "Mysore, Karnataka", "Hubli, Karnataka", "Mangalore, Karnataka", "Belgaum, Karnataka",
    "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Tiruchirappalli, Tamil Nadu", "Salem, Tamil Nadu", "Tiruppur, Tamil Nadu", "Erode, Tamil Nadu",
    "Hyderabad, Telangana", "Warangal, Telangana", "Nizamabad, Telangana", "Karimnagar, Telangana",
    "Visakhapatnam, Andhra Pradesh", "Vijayawada, Andhra Pradesh", "Guntur, Andhra Pradesh", "Nellore, Andhra Pradesh", "Kurnool, Andhra Pradesh",
    "Kochi, Kerala", "Thiruvananthapuram, Kerala", "Kozhikode, Kerala", "Thrissur, Kerala", "Kannur, Kerala",
    "Kolkata, West Bengal", "Howrah, West Bengal", "Siliguri, West Bengal", "Durgapur, West Bengal", "Asansol, West Bengal",
    "Patna, Bihar", "Gaya, Bihar", "Muzaffarpur, Bihar", "Bhagalpur, Bihar",
    "Bhubaneswar, Odisha", "Cuttack, Odisha", "Rourkela, Odisha", "Berhampur, Odisha",
    "Ranchi, Jharkhand", "Jamshedpur, Jharkhand", "Dhanbad, Jharkhand", "Bokaro, Jharkhand",
    "Guwahati, Assam", "Silchar, Assam", "Dibrugarh, Assam",
    "Raipur, Chhattisgarh", "Bhilai, Chhattisgarh", "Bilaspur, Chhattisgarh"
];

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [sellers, setSellers] = useState<any[]>([]);
    const [filteredSellers, setFilteredSellers] = useState<any[]>([]);
    const [loadingSellers, setLoadingSellers] = useState(false);

    // Location State
    const [selectedCity, setSelectedCity] = useState("All India");
    const [citySearch, setCitySearch] = useState("");

    // Chat Modal State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<{ name: string, id: string } | null>(null);

    const openChat = (seller: any) => {
        setSelectedSeller({
            name: seller.name,
            id: seller._id // Use MongoDB _id (phone is private now)
        });
        setIsChatOpen(true);
    };

    // 1. Static Product Search (Existing Logic)
    const productResults = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        const filtered = [];

        for (const category of industrialProducts) {
            const matchingProducts = category.products.filter(product =>
                product.toLowerCase().includes(lowerQuery)
            );

            if (matchingProducts.length > 0) {
                filtered.push({
                    category: category.category,
                    products: matchingProducts
                });
            }
        }
        return filtered;
    }, [query]);

    // 2. Dynamic Seller Search (New API Logic)
    useEffect(() => {
        if (!query) {
            setSellers([]);
            return;
        }

        const fetchSellers = async () => {
            setLoadingSellers(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.success) {
                    setSellers(data.data);
                    setFilteredSellers(data.data); // Initialize filtered list
                }
            } catch (error) {
                console.error("Error fetching sellers:", error);
            }
            setLoadingSellers(false);
        };

        fetchSellers();
    }, [query]);

    // 3. Filter Sellers by City
    useEffect(() => {
        if (selectedCity === "All India") {
            setFilteredSellers(sellers);
        } else {
            // Extract base city name (e.g., "Delhi, Delhi" → "Delhi")
            const baseCityName = selectedCity.split(',')[0].trim().toLowerCase();

            setFilteredSellers(sellers.filter(seller => {
                const sellerCity = seller.city?.toLowerCase() || '';
                // Match if either contains the other (handles both "Delhi" and "Delhi, Delhi")
                return sellerCity.includes(baseCityName) || baseCityName.includes(sellerCity);
            }));
        }
    }, [selectedCity, sellers]);

    const handleNearMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                // In a real app, we'd use Google Maps Geocoding API here to get the city name
                // For now, we'll simulate it or ask user to enter
                alert("Locating... (Simulated: Setting to Mumbai for demo)");
                setSelectedCity("Mumbai");
            }, (error) => {
                alert("Unable to retrieve your location");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const totalResults = productResults.reduce((acc, cat) => acc + cat.products.length, 0) + filteredSellers.length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Chat Modal */}
            {selectedSeller && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    sellerName={selectedSeller.name}
                    sellerId={selectedSeller.id}
                />
            )}

            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Link>

                    {/* LOCATION BAR */}
                    <div className="bg-white p-3 md:p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
                        <div className="flex items-center px-3 md:border-r border-gray-200 min-w-fit w-full md:w-auto">
                            <span className="font-semibold text-gray-700 mr-2 text-sm md:text-base">Location</span>
                            <div className="relative flex-1 md:flex-none">
                                <input
                                    type="text"
                                    placeholder="Search City"
                                    value={citySearch}
                                    onChange={(e) => {
                                        setCitySearch(e.target.value);
                                        if (e.target.value) setSelectedCity(e.target.value);
                                    }}
                                    className="border border-gray-300 rounded px-2 py-2 md:py-1 text-sm w-full md:w-32 focus:outline-none focus:border-blue-500"
                                />
                                <Search size={14} className="absolute right-2 top-2.5 md:top-1.5 text-gray-400" />
                            </div>
                        </div>

                        <button
                            onClick={handleNearMe}
                            className="flex items-center justify-center text-blue-600 font-medium text-sm hover:bg-blue-50 px-4 py-2 md:px-3 md:py-1.5 rounded transition-colors w-full md:w-auto"
                        >
                            <Crosshair size={16} className="mr-1.5" />
                            Near Me
                        </button>

                        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full -mx-3 px-3 md:mx-0 md:px-0">
                            {POPULAR_CITIES.map(city => (
                                <button
                                    key={city}
                                    onClick={() => setSelectedCity(city)}
                                    className={`px-3 py-2 md:py-1.5 text-xs md:text-sm rounded whitespace-nowrap transition-colors ${selectedCity === city
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                        Search Results for <span className="text-blue-600">"{query}"</span>
                        {selectedCity !== "All India" && <span className="text-gray-500 text-base sm:text-lg ml-2 block sm:inline mt-1 sm:mt-0">in {selectedCity}</span>}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Found {totalResults} results
                    </p>
                </div>

                {totalResults === 0 && !loadingSellers ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                        <p className="text-gray-500">Try searching for something else, like "Steel", "Pumps", or "Valves"</p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* SECTION 1: VERIFIED SELLERS (Dynamic Data) */}
                        {filteredSellers.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <Verified className="text-green-600 mr-2" />
                                    Verified Sellers & Suppliers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSellers.map((seller, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{seller.name}</h3>
                                                {seller.isVerified && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 flex items-center">
                                                <MapPin size={14} className="mr-1" />
                                                {seller.city}
                                            </p>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    {seller.category}
                                                </span>
                                                <button
                                                    onClick={() => openChat(seller)}
                                                    className="flex items-center text-blue-600 font-bold text-sm hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                                                >
                                                    <MessageCircle size={16} className="mr-1.5" />
                                                    Chat with Supplier
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: PRODUCT CATEGORIES (Static Data) */}
                        {productResults.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Matching Product Categories</h2>
                                <div className="space-y-6">
                                    {productResults.map((category, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                                <h2 className="font-semibold text-gray-800">{category.category}</h2>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {category.products.map((product, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group"
                                                        >
                                                            <span className="text-gray-600 group-hover:text-blue-700 text-sm font-medium">
                                                                {product}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Loading Search Results...</div>}>
            <SearchContent />
        </Suspense>
    );
}