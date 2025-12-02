"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Search, PlusCircle, ChevronDown, TrendingUp, MessageCircle } from 'lucide-react';
import PostRequirementModal from '@/components/PostRequirementModal';
import { industrialProducts } from '@/lib/industrialData';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostReqOpen, setIsPostReqOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [customUser, setCustomUser] = useState<any>(null);

  // 1. Fetch Custom Auth Session
  React.useEffect(() => {
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

  // 2. Close Dropdown on Outside Click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = session?.user || customUser;
  const homeHref = user?.role === 'seller' ? '/seller/dashboard' : user?.role === 'buyer' ? '/buyer/dashboard' : '/';

  // 3. Autocomplete Logic
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
          <div className="flex justify-between items-center h-20 gap-6">

            {/* 1. LOGO */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push(homeHref)}>
              <div className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
                  YB
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="font-bold text-xl text-gray-900 tracking-tight leading-none">
                    YouthBharat
                  </span>
                  <span className="font-semibold text-[10px] text-blue-600 tracking-wide uppercase ml-0.5">
                    WholesaleMart
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SEARCH BOX (Modern Big Style) */}
            <div className="flex-1 max-w-6xl mx-4 lg:mx-8 hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-5 text-gray-400 group-hover:text-blue-500 transition-colors" size={22} />
                  
                  <input
                    type="text"
                    placeholder="Search for products, suppliers, or categories..."
                    className="w-full pl-14 pr-32 h-14 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50 transition-all duration-300 placeholder:text-gray-400 text-gray-800 shadow-sm group-hover:bg-white group-hover:shadow-md text-lg"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  />
                  
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-bold text-base shadow-md flex items-center gap-2 hover:shadow-lg active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                   {suggestions.length > 0 ? (
                       <ul>
                           {suggestions.map((item, index) => (
                               <li 
                                   key={index}
                                   onClick={() => {
                                       setSearchQuery(item);
                                       handleSearchSubmit(undefined, item);
                                   }}
                                   className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                               >
                                   <Search size={16} className="text-gray-400" />
                                   <span dangerouslySetInnerHTML={{
                                       __html: item.replace(new RegExp(searchQuery, "gi"), (match) => `<span class="font-bold text-blue-600">${match}</span>`)
                                   }} />
                               </li>
                           ))}
                           <li 
                                onClick={(e) => handleSearchSubmit(e)}
                                className="px-6 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-blue-600 font-semibold text-center flex items-center justify-center gap-2"
                           >
                               See all results for "{searchQuery}" <TrendingUp size={16}/>
                           </li>
                       </ul>
                   ) : (
                       <div className="p-6 text-center text-gray-500">
                           <p>No direct matches found.</p>
                           <button 
                                onClick={(e) => handleSearchSubmit(e)}
                                className="text-blue-600 font-semibold hover:underline mt-2 text-sm"
                           >
                               Run Deep Search
                           </button>
                       </div>
                   )}
                </div>
              )}
            </div>

            {/* 3. DESKTOP ACTIONS (Smaller & Compact) */}
            <div className="hidden md:flex md:items-center md:space-x-1 flex-shrink-0">

              {/* For Buyer Dropdown */}
              <div className="relative group h-16 flex items-center px-2">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                  For Buyers <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 transform transition-all origin-top-right animate-in fade-in slide-in-from-top-2 z-50">
                  <button onClick={() => setIsPostReqOpen(true)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2">
                    <PlusCircle size={16}/> Post Requirement
                  </button>
                  <Link href="/search" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Browse Suppliers
                  </Link>
                  <Link href="/buyer/messages" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2">
                     <MessageCircle size={16}/> Messages
                  </Link>
                  <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    How It Works
                  </Link>
                  
                  {/* ADDED: Buyer Logout Button */}
                  {user?.role === 'buyer' && (
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium flex items-center gap-2 border-t border-gray-100 mt-1"
                    >
                      <LogOut size={16}/> Logout
                    </button>
                  )}
                </div>
              </div>

              {/* For Seller Dropdown */}
              <div className="relative group h-16 flex items-center px-2">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                  For Sellers <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 transform transition-all origin-top-right animate-in fade-in slide-in-from-top-2 z-50">
                  <Link href="/register?role=seller" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Sell on YouthBharat
                  </Link>
                  <Link href="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Seller Login
                  </Link>
                  <Link href="/seller/messages" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2">
                     <MessageCircle size={16}/> Seller Messages
                  </Link>
                  <Link href="/seller/pricing" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Membership Plans
                  </Link>

                  {/* ADDED: Seller Logout Button */}
                  {user?.role === 'seller' && (
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium flex items-center gap-2 border-t border-gray-100 mt-1"
                    >
                      <LogOut size={16}/> Logout
                    </button>
                  )}
                </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

              {/* Post Req Button */}
              <button
                onClick={() => setIsPostReqOpen(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all hover:shadow-lg hover:shadow-red-100 flex items-center gap-1.5 transform hover:-translate-y-0.5 active:translate-y-0 mx-1"
              >
                <PlusCircle size={16} /> <span>Post Buy Req</span>
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    href={homeHref}
                    className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    title="Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-blue-100 hover:-translate-y-0.5"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>

            {/* 4. MOBILE MENU TOGGLE */}
            <div className="flex items-center md:hidden gap-3">
              <button 
                onClick={() => setIsPostReqOpen(true)} 
                className="text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
              >
                <PlusCircle size={24} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* 5. MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full left-0 p-5 flex flex-col gap-5 animate-in slide-in-from-top-4 z-40 h-screen overflow-y-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-4 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>

            <button onClick={() => { setIsPostReqOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-transform flex justify-center gap-2 text-lg">
              <PlusCircle size={24} /> Post Buy Requirement
            </button>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">For Buyers</p>
              <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-base">Browse Suppliers</Link>
              <Link href="/buyer/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-base">Messages</Link>
            </div>
             <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">For Sellers</p>
              <Link href="/register?role=seller" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-base">Sell on YouthBharat</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-base">Seller Login</Link>
              <Link href="/seller/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-base">Seller Messages</Link>
            </div>
            
            <div className="border-t border-gray-100 pt-6 pb-4 mt-auto">
              {user ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link href={homeHref} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3.5 rounded-xl font-bold text-lg">
                    <LayoutDashboard size={22}/> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-lg">
                    <LogOut size={22}/> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-lg">Sign In</Link>
                   <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md text-lg">Join Free</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <PostRequirementModal isOpen={isPostReqOpen} onClose={() => setIsPostReqOpen(false)} />
    </>
  );
}