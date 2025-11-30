"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, User, ShoppingBag, Menu, X, Loader2, Crosshair } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import PostRequirementModal from "./PostRequirementModal";
import RegisterModal from "./RegisterModal";

// --- 1. CONFIGURATION: City Database ---
// Comprehensive list of major Indian commercial hubs to match against
const INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli",
    "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi",
    "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
    "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar",
    "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Warangal", "Thiruvananthapuram", "Bhiwandi",
    "Saharanpur", "Guntur", "Amravati", "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi",
    "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain",
    "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum",
    "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala"
];

// --- 2. UTILS: Fuzzy Matching Logic ---
// Calculates how many edits (insert, delete, sub) it takes to turn 'a' into 'b'
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const findClosestCity = (input: string): string | null => {
    if (!input || input.length < 3) return null; // Don't correct very short strings
    const lowerInput = input.toLowerCase();
    
    // Exact match check first
    const exactMatch = INDIAN_CITIES.find(c => c.toLowerCase() === lowerInput);
    if (exactMatch) return exactMatch;

    let closestCity = null;
    let minDistance = Infinity;

    for (const city of INDIAN_CITIES) {
        const distance = getLevenshteinDistance(lowerInput, city.toLowerCase());
        // Threshold: Allow roughly 1 error per 3 characters (e.g., "Dlih" (4 chars) -> distance 2 is okay)
        const threshold = Math.max(2, Math.floor(city.length / 3)); 
        
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            closestCity = city;
        }
    }
    return closestCity;
};

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    
    // User Dropdown States
    const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
    const [showSellerDropdown, setShowSellerDropdown] = useState(false);
    
    // Location State
    const [isLocating, setIsLocating] = useState(false);

    // Flatten products for easier searching
    const allProducts = useMemo(() => {
        return industrialProducts.flatMap(cat => cat.products);
    }, []);

    // ✅ UPDATED SEARCH HANDLER WITH AUTO-CORRECT
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);

        // Split by " in " to separate Product from City
        const parts = query.split(/ in /i);
        const productPart = parts[0];
        const cityPart = parts.length > 1 ? parts[1] : "";

        let newSuggestions: string[] = [];

        // A. Filter Products
        if (productPart.trim().length > 1) {
            const filteredProducts = allProducts.filter(item =>
                item.toLowerCase().includes(productPart.toLowerCase())
            ).slice(0, 8); // Top 8 results

            // If user hasn't typed 'in' yet, suggest products directly
            if (!query.toLowerCase().includes(" in ")) {
                newSuggestions = filteredProducts;
            } else {
                // If 'in' exists, try to find a city correction
                let targetCity = cityPart;
                const correctedCity = findClosestCity(cityPart.trim());
                
                if (correctedCity) {
                    targetCity = correctedCity;
                }

                // Map products to the (possibly corrected) city
                // e.g. "Rice in Dlih" -> Suggests "Basmati Rice in Delhi"
                newSuggestions = filteredProducts.map(p => `${p} in ${targetCity}`);

                // If no products match but we have a valid city correction, suggest the correction itself
                // e.g. User types "RandomThing in Dlih" -> Suggest "RandomThing in Delhi"
                if (newSuggestions.length === 0 && correctedCity && correctedCity.toLowerCase() !== cityPart.toLowerCase().trim()) {
                    newSuggestions.push(`${productPart.trim()} in ${correctedCity}`);
                }
            }
        }

        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
    };

    // Handle suggestion click
    const handleSuggestionClick = (item: string) => {
        setSearchQuery(item);
        setShowSuggestions(false);
        // Optional: Trigger search immediately
        // window.location.href = `/search?q=${encodeURIComponent(item)}`;
    };

    // ✅ AUTO-CORRECT ON SUBMIT
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        let finalQuery = searchQuery;

        // Check if query contains " in " and attempt to correct the city part
        if (searchQuery.toLowerCase().includes(" in ")) {
            const parts = searchQuery.split(/ in /i);
            const product = parts[0].trim();
            const city = parts[1].trim();
            
            const correctedCity = findClosestCity(city);

            // If a correction is found and it's different from what was typed
            if (correctedCity && correctedCity.toLowerCase() !== city.toLowerCase()) {
                finalQuery = `${product} in ${correctedCity}`;
            }
        }

        window.location.href = `/search?q=${encodeURIComponent(finalQuery)}`;
        setShowSuggestions(false);
    };

    // Handle Live Location Detection
    const handleLiveLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Use OpenStreetMap Nominatim (Free Reverse Geocoding)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                
                // Extract City > Town > Village > State
                const address = data.address;
                const detectedCity = address.city || address.town || address.village || address.state_district || address.state;

                if (detectedCity) {
                    setSearchQuery(prev => {
                        // If query exists, append location. If empty, just set location placeholder logic
                        const cleanQuery = prev.replace(/ in .*/i, ''); // Remove existing location context if any
                        return cleanQuery ? `${cleanQuery} in ${detectedCity}` : ` in ${detectedCity}`;
                    });
                    
                    // Focus the input so they can type the product before " in City"
                    const input = document.getElementById('search-input');
                    if (input) input?.focus();
                }
            } catch (error) {
                console.error("Location Error:", error);
                alert("Could not fetch address details.");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            console.error("Geo Error:", error);
            setIsLocating(false);
            alert("Unable to retrieve your location. Please enable permissions.");
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest('.relative.z-50')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <PostRequirementModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
            <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />

            <header className="w-full font-sans sticky top-0 z-40 bg-white">
                {/* Top Bar */}
                <div className="bg-gray-100 border-b border-gray-200 text-xs text-gray-600">
                    <div className="container mx-auto px-4 h-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="font-medium text-blue-700">Welcome to YouthBharat!</span>
                            <Link href="/login?role=buyer" className="hover:text-blue-700 font-semibold text-blue-600 border border-blue-600 px-3 py-0.5 rounded-sm bg-white transition-colors">
                                Sign In as Buyer
                            </Link>
                            <button onClick={() => setIsRegisterModalOpen(true)} className="hover:bg-blue-800 bg-blue-700 text-white px-3 py-0.5 rounded-sm font-semibold transition-colors">
                                Join Free as Seller
                            </button>
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            {/* Buyer Dropdown */}
                            <div className="relative" onMouseEnter={() => setShowBuyerDropdown(true)} onMouseLeave={() => setShowBuyerDropdown(false)}>
                                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                                    <User size={14} className="text-blue-600" />
                                    <span>For Buyer</span>
                                    <ChevronDown size={12} />
                                </div>
                                {showBuyerDropdown && (
                                    <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-md py-2 w-48 z-50 border border-gray-100">
                                        <Link href="/buyer/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Dashboard</Link>
                                        <Link href="/buyer/requirements" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Requirements</Link>
                                        <Link href="/buyer/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Messages</Link>
                                        <Link href="/buyer/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Orders</Link>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">Logout</button>
                                    </div>
                                )}
                            </div>

                            {/* Seller Dropdown */}
                            <div className="relative" onMouseEnter={() => setShowSellerDropdown(true)} onMouseLeave={() => setShowSellerDropdown(false)}>
                                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                                    <ShoppingBag size={14} className="text-blue-600" />
                                    <span>For Seller</span>
                                    <ChevronDown size={12} />
                                </div>
                                {showSellerDropdown && (
                                    <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-md py-2 w-48 z-50 border border-gray-100">
                                        <Link href="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Dashboard</Link>
                                        <Link href="/seller/leads" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Leads</Link>
                                        <Link href="/seller/wallet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Wallet & Credits</Link>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Navbar */}
                <div className="bg-white shadow-sm py-3">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <Link href="/" className="flex-shrink-0">
                            {/* Ensure your logo image exists at /public/logo.png */}
                            <Image src="/logo.png" alt="YouthBharat" width={450} height={120} className="h-12 w-auto object-contain" priority />
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 w-full max-w-3xl mx-4 relative z-50">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex w-full border-2 border-blue-600 rounded-full overflow-visible relative bg-white"
                            >
                                <div className="hidden sm:flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-600 text-sm min-w-[140px] justify-between rounded-l-full">
                                    <span>Products / Services</span>
                                    <ChevronDown size={14} />
                                </div>
                                
                                <div className="flex-1 relative">
                                    <input
                                        id="search-input"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => { 
                                            // Trigger suggestions refresh on focus
                                            handleSearchChange(searchQuery); 
                                        }}
                                        placeholder="e.g. Wholesale Rice in Delhi, Basmati Rice in Delhi..."
                                        className="w-full h-full px-4 py-2.5 outline-none text-gray-700 rounded-none bg-transparent"
                                        autoComplete="off"
                                    />
                                    
                                    {/* Live Location Button */}
                                    <button
                                        type="button"
                                        onClick={handleLiveLocation}
                                        disabled={isLocating}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                                        title="Use Live Location"
                                    >
                                        {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
                                    </button>
                                </div>

                                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 font-medium flex items-center transition-colors rounded-r-full">
                                    <Search size={20} className="mr-2" />
                                    Search
                                </button>
                            </form>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                                    {suggestions.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSuggestionClick(item)}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-50 last:border-0"
                                        >
                                            <Search size={14} className="text-gray-400 mr-3" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="hidden md:block">
                            <button onClick={() => setIsPostModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-colors text-sm">
                                Post Buy Requirement
                            </button>
                        </div>

                        <button className="md:hidden text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-4 shadow-lg absolute w-full z-40">
                        <Link href="/buyer/dashboard" className="block text-gray-700 font-medium py-2">For Buyer</Link>
                        <Link href="/seller/dashboard" className="block text-gray-700 font-medium py-2">For Seller</Link>
                        <button onClick={() => { setIsMobileMenuOpen(false); setIsPostModalOpen(true); }} className="bg-red-600 text-white w-full py-3 rounded-md font-bold mt-2">
                            Post Buy Requirement
                        </button>
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;