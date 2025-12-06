"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Search, PlusCircle, ChevronDown, MessageCircle, Megaphone, User, LogIn, HelpCircle } from 'lucide-react';
import PostRequirementModal from '@/components/PostRequirementModal';
import { industrialProducts } from '@/lib/industrialData';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostReqOpen, setIsPostReqOpen] = useState(false);

  // Search State - Added Types
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [customUser, setCustomUser] = useState<any>(null);

  // 1. Fetch Custom Auth Session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          setCustomUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  // 2. Close Dropdown on Outside Click (FIXED TYPE ERROR HERE)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const user = session?.user || customUser;
  
  // Dynamic Dashboard Link
  const dashboardLink = user 
    ? (user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard') 
    : '/login';

  // 3. Autocomplete Logic - Added Types
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const allProducts = industrialProducts.flatMap(cat => cat.products);
      const matches = allProducts
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);

      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = overrideQuery || searchQuery;

    if (finalQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm/[0.05]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-3 md:gap-6">

            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push(dashboardLink)}>
              <div className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
                  YB
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="font-bold text-xl text-gray-900 tracking-tight leading-none hidden sm:block">
                    YouthBharat
                  </span>
                  <span className="font-bold text-xl text-gray-900 tracking-tight leading-none sm:hidden">
                    YB
                  </span>
                  <span className="font-semibold text-[10px] text-blue-600 tracking-wide uppercase ml-0.5 hidden sm:block">
                    WholesaleMart
                  </span>
                </div>
              </div>
            </div>

            {/* DESKTOP SEARCH BOX */}
            <div className="flex-1 max-w-6xl mx-2 lg:mx-8 hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-5 text-gray-400 group-hover:text-blue-500 transition-colors" size={22} />
                  <input
                    type="text"
                    placeholder="Search for products, suppliers..."
                    className="w-full pl-14 pr-32 h-14 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50 transition-all duration-300 placeholder:text-gray-400 text-gray-800 shadow-sm group-hover:bg-white group-hover:shadow-md text-lg"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  />
                  <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-bold text-base shadow-md flex items-center gap-2 hover:shadow-lg active:scale-95">
                    Search
                  </button>
                </div>
              </form>
              {/* Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((item, index) => (
                        <li key={index} onClick={() => { setSearchQuery(item); handleSearchSubmit(undefined, item); }} className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 text-gray-700 border-b border-gray-50 last:border-0">
                          <Search size={16} className="text-gray-400" />
                          <span dangerouslySetInnerHTML={{ __html: item.replace(new RegExp(searchQuery, "gi"), (match) => `<span class="font-bold text-blue-600">${match}</span>`) }} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-gray-500">No direct matches found.</div>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex md:items-center md:space-x-1 flex-shrink-0">
              
              {/* Buyer Menu */}
              <div className="relative group h-16 flex items-center px-2">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm">
                  For Buyers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 z-50">
                  
                  {/* Buyer Dashboard */}
                  <Link href={dashboardLink} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <button onClick={() => setIsPostReqOpen(true)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <PlusCircle size={16} /> Post Requirement
                  </button>
                  <Link href="/buyer/messages" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <MessageCircle size={16} /> Messages
                  </Link>
                  <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <HelpCircle size={16} /> How It Works
                  </Link>
                  {user?.role === 'buyer' && (
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 border-t border-gray-100 mt-1">
                      <LogOut size={16} /> Logout
                    </button>
                  )}
                </div>
              </div>

              {/* Seller Menu */}
              <div className="relative group h-16 flex items-center px-2">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm">
                  For Sellers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 z-50">
                   
                  {/* Seller Dashboard */}
                  <Link href={dashboardLink} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <Link href="/seller/messages" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <MessageCircle size={16} /> Seller Messages
                  </Link>
                  <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <HelpCircle size={16} /> How It Works
                  </Link>
                  {user?.role === 'seller' && (
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 border-t border-gray-100 mt-1">
                      <LogOut size={16} /> Logout
                    </button>
                  )}
                </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

              {/* Post Req */}
              <button onClick={() => setIsPostReqOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5 mx-1">
                <PlusCircle size={16} /> <span className="hidden lg:inline">Post Buy Req</span><span className="lg:hidden">Post</span>
              </button>

              {/* DASHBOARD BUTTON (ALWAYS VISIBLE - BEFORE AUTH) */}
              <div className="flex items-center gap-2 ml-1">
                <Link 
                  href={dashboardLink}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full font-bold text-sm transition-colors border border-blue-200"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>
              </div>

              {/* AUTH BUTTONS (Only if NOT logged in) */}
              {!user && (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50">Sign In</Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">Join Free</Link>
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE & ACTION BAR */}
            <div className="flex items-center md:hidden gap-2">
              <button onClick={() => setIsPostReqOpen(true)} className="text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 border border-red-100">
                <PlusCircle size={22} />
              </button>

              {/* Mobile Dashboard Icon (Direct Link) */}
              <Link href={dashboardLink} className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 border border-blue-100">
                <LayoutDashboard size={22} />
              </Link>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU (FIXED & SCROLLABLE) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-white z-50 overflow-y-auto pb-20 animate-in slide-in-from-top-2">
            <div className="p-4 flex flex-col gap-4">
              
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>

              {/* DASHBOARD BUTTON (Highlighted Top Item) */}
              <Link 
                href={dashboardLink}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 rounded-xl font-bold border-2 border-blue-100 text-lg shadow-sm"
              >
                <LayoutDashboard size={24} /> My Dashboard
              </Link>

              {/* AUTH BUTTONS (If NOT logged in) */}
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold">
                      <LogIn size={20} /> Sign In
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md">
                    <User size={20} /> Join Free
                  </Link>
                </div>
              )}

              {/* Actions */}
              <button onClick={() => { setIsPostReqOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-50 flex justify-center gap-2">
                <PlusCircle size={20} /> Post Buy Requirement
              </button>

              <div className="border-t border-gray-100 pt-2 space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">Menu</p>
                
                {/* Mobile How It Works */}
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                    <HelpCircle size={18} /> How It Works
                </Link>

                {user?.role === 'seller' ? (
                  <>
                      <Link href="/seller/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                      <MessageCircle size={18} /> Seller Messages
                    </Link>
                    <Link href="/seller/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                      <LayoutDashboard size={18} /> My Products
                    </Link>
                  </>
                ) : (
                  <Link href="/buyer/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                    <MessageCircle size={18} /> Buyer Messages
                  </Link>
                )}
              </div>

              {user && (
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3.5 rounded-xl">
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- POST REQUIREMENT BANNER --- */}
      <div onClick={() => setIsPostReqOpen(true)} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5 truncate">
            <Megaphone className="text-blue-600 flex-shrink-0" size={16} />
            <span>Post your Requirement & Get Verified Sellers!</span>
          </p>
          <button className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            Post Now
          </button>
        </div>
      </div>

      <PostRequirementModal isOpen={isPostReqOpen} onClose={() => setIsPostReqOpen(false)} />
    </>
  );
}