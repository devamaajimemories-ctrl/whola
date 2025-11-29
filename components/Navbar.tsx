"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, User, HelpCircle, ShoppingBag, Menu, X } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import PostRequirementModal from "./PostRequirementModal";
import RegisterModal from "./RegisterModal";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
    const [showSellerDropdown, setShowSellerDropdown] = useState(false);
    const [showHelpDropdown, setShowHelpDropdown] = useState(false);

    // Flatten products for easier searching
    const allProducts = React.useMemo(() => {
        return industrialProducts.flatMap(cat => cat.products);
    }, []);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 1) {
            const filtered = allProducts.filter(item =>
                item.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10); // Limit to 10 suggestions
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
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

            <header className="w-full font-sans">
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
                            {/* For Buyer Dropdown */}
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

                            {/* For Seller Dropdown */}
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
                                        <Link href="/seller/sales" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">My Sales</Link>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">Logout</button>
                                    </div>
                                )}
                            </div>

                            {/* Help Dropdown */}
                            <div className="relative" onMouseEnter={() => setShowHelpDropdown(true)} onMouseLeave={() => setShowHelpDropdown(false)}>
                                <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                                    <HelpCircle size={14} className="text-blue-600" />
                                    <span>Help</span>
                                    <ChevronDown size={12} />
                                </div>
                                {showHelpDropdown && (
                                    <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-md py-2 w-48 z-50 border border-gray-100">
                                        <Link href="/how-it-works" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">How It Works</Link>
                                        <Link href="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Contact Support</Link>
                                        <Link href="/terms" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Terms & Privacy</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Navbar */}
                <div className="bg-white shadow-sm py-3">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src="/logo.png"
                                alt="YouthBharat WholesaleMart"
                                width={450}
                                height={120}
                                className="h-32 w-auto object-contain"
                                priority
                            />
                        </Link>

                        {/* Search Bar with Autocomplete */}
                        <div className="flex-1 w-full max-w-3xl mx-4 relative z-50">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                                        setShowSuggestions(false);
                                    }
                                }}
                                className="flex w-full border-2 border-blue-600 rounded-full overflow-visible relative bg-white"
                            >
                                <div className="hidden sm:flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-600 text-sm cursor-pointer hover:bg-gray-100 min-w-[140px] justify-between rounded-l-full">
                                    <span>Products / Services</span>
                                    <ChevronDown size={14} />
                                </div>
                                <input
                                    type="text"
                                    name="q"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => {
                                        if (searchQuery.trim()) setShowSuggestions(true);
                                    }}
                                    placeholder="Enter product / service to search"
                                    className="flex-1 px-4 py-2.5 outline-none text-gray-700"
                                    autoComplete="off"
                                />
                                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 font-medium flex items-center transition-colors rounded-r-full">
                                    <Search size={20} className="mr-2" />
                                    Search
                                </button>
                            </form>

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                                    {suggestions.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setSearchQuery(item);
                                                setShowSuggestions(false);
                                                window.location.href = `/search?q=${encodeURIComponent(item)}`;
                                            }}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-50 last:border-0"
                                        >
                                            <Search size={14} className="text-gray-400 mr-3" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Post Requirement Button */}
                        <div className="hidden md:block">
                            <button
                                onClick={() => setIsPostModalOpen(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-colors text-sm whitespace-nowrap"
                            >
                                Post Buy Requirement
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div >
                </div >

                {/* Mobile Menu (Simplified) */}
                {
                    isMobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-4">
                            <div className="flex flex-col space-y-3">
                                <Link href="#" className="text-gray-700 font-medium">For Buyer</Link>
                                <Link href="#" className="text-gray-700 font-medium">For Seller</Link>
                                <Link href="#" className="text-gray-700 font-medium">Help</Link>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsPostModalOpen(true);
                                    }}
                                    className="bg-red-600 text-white w-full py-2 rounded-md font-bold"
                                >
                                    Post Buy Requirement
                                </button>
                            </div>
                        </div>
                    )
                }
            </header >
        </>
    );
};

export default Navbar;
