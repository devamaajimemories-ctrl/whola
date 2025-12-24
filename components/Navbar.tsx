"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Menu, X, LogOut, LayoutDashboard, Search, PlusCircle, 
  ChevronDown, MessageCircle, Megaphone, User, LogIn, 
  HelpCircle, MapPin, Crosshair, Loader2, Package // ✅ Imported Package Icon
} from 'lucide-react';
import PostRequirementModal from '@/components/PostRequirementModal';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostReqOpen, setIsPostReqOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [customUser, setCustomUser] = useState<any>(null);

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

  // Search Debounce Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/global-search?q=${searchQuery}`);
          const data = await res.json();
          setSuggestions(data.results || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search Fetch Error:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const detectedCity = data.address.city || data.address.town || data.address.state_district || "";
            if (detectedCity) setSearchLocation(detectedCity);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLocating(false);
        }
    }, () => setIsLocating(false));
  };

  const user = session?.user || customUser;
  const dashboardLink = user 
    ? (user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard') 
    : '/login';

  const handleSearchSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = overrideQuery || searchQuery;
    if (finalQuery.trim()) {
      setShowSuggestions(false);
      const params = new URLSearchParams();
      params.set('q', finalQuery);
      if (searchLocation.trim()) params.set('loc', searchLocation);
      router.push(`/search?${params.toString()}`);
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
        <div className="max-w-[1900px] mx-auto px-3 sm:px-6 lg:px-6">
          <div className="flex justify-between items-center h-20 gap-3 md:gap-4">

            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <div className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
                  YB
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="font-bold text-lg text-gray-900 tracking-tight leading-none hidden xl:block">
                    YouthBharat
                  </span>
                  <span className="font-bold text-xl text-gray-900 tracking-tight leading-none xl:hidden hidden sm:block">
                    YB
                  </span>
                  <span className="font-semibold text-[9px] text-blue-600 tracking-wide uppercase ml-0.5 hidden xl:block">
                    WholesaleMart
                  </span>
                </div>
              </div>
            </div>

            {/* SEARCH BOX */}
            <div className="flex-1 mx-2 lg:mx-4 hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group w-full">
                <div className="relative flex items-center bg-gray-50 border-2 border-gray-200 rounded-full hover:shadow-md focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300">
                  <div className="flex-1 relative flex items-center h-14 pl-5">
                    <Search className="text-gray-400 shrink-0 mr-3 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                      type="text"
                      placeholder="Search for products, suppliers..."
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                    />
                    {isSearching && <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />}
                  </div>
                  <div className="w-px h-8 bg-gray-300 mx-2"></div>
                  <div className="relative flex items-center h-14 w-[25%] min-w-[140px]">
                    <MapPin className="text-gray-400 shrink-0 ml-3 mr-2" size={18} />
                    <input
                      type="text"
                      placeholder="City..."
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-base truncate"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    <button type="button" onClick={handleDetectLocation} className="p-2 mr-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                      {isLocating ? <Loader2 size={18} className="animate-spin"/> : <Crosshair size={18}/>}
                    </button>
                  </div>
                  <button type="submit" className="m-1 px-8 h-11 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-bold text-sm shadow-sm flex items-center justify-center active:scale-95 shrink-0">Search</button>
                </div>
              </form>
              
              {/* SUGGESTIONS */}
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                   {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((item, index) => (
                        <li key={index} onClick={() => { if(item.url) router.push(item.url); else { setSearchQuery(item.title); handleSearchSubmit(undefined, item.title); }}} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors">
                           <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                             {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover"/> : <Search size={16} className="text-gray-400"/>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm truncate">{item.title}</h4>
                              <p className="text-xs text-gray-500 truncate">{item.type} • {item.location}</p>
                           </div>
                        </li>
                      ))}
                    </ul>
                   ) : <div className="p-6 text-center text-gray-500">No matches found.</div>}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="hidden md:flex md:items-center md:space-x-1 flex-shrink-0">
                
              {/* ✅ BUYER MENU (Updated) */}
              <div className="relative group h-16 flex items-center px-1.5">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm">
                  <span className="hidden 2xl:inline">For </span>Buyers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 z-50">
                  <Link href="/buyer/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/buyer/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <Package size={16} /> My Orders {/* ✅ Added */}
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
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border-t border-gray-100 mt-1 flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>

              {/* ✅ SELLER MENU (Updated) */}
              <div className="relative group h-16 flex items-center px-1.5">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm">
                  <span className="hidden 2xl:inline">For </span>Sellers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[75%] right-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-1.5 z-50">
                  <Link href="/seller/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/seller/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <Package size={16} /> Manage Orders {/* ✅ Added */}
                  </Link>
                  <Link href="/seller/messages" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center justify-between group">
                    <div className="flex items-center gap-2"><MessageCircle size={16} /> Messages</div>
                  </Link>
                  <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2">
                    <HelpCircle size={16} /> How It Works
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border-t border-gray-100 mt-1 flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

              {/* Action Buttons */}
              <button onClick={() => setIsPostReqOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 mx-1 transition-transform hover:scale-105">
                <PlusCircle size={16} /> <span className="hidden xl:inline">Post Buy Req</span><span className="xl:hidden">Post</span>
              </button>

              <div className="flex items-center gap-2 ml-1">
                {!user && (
                   <div className="flex items-center gap-3">
                      <Link href="/login" className="text-gray-700 font-medium hover:text-blue-600 text-sm">Login</Link>
                      <Link href="/register?role=seller" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-700 transition">Become a Seller</Link>
                   </div>
                )}
                {user && (
                   <Link href={dashboardLink} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-100 transition">
                     <LayoutDashboard size={16}/> Dashboard
                   </Link>
                )}
              </div>
            </div>

            {/* MOBILE MENU BUTTONS */}
            <div className="flex items-center md:hidden gap-2">
              <button onClick={() => setIsPostReqOpen(true)} className="text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 border border-red-100">
                <PlusCircle size={22} />
              </button>
              <Link href={dashboardLink} className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 border border-blue-100">
                <LayoutDashboard size={22} />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU CONTENT (Updated) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-white z-50 overflow-y-auto pb-20 animate-in slide-in-from-top-2">
            <div className="p-4 flex flex-col gap-4">
              
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Location (City)"
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                  <button type="button" onClick={handleDetectLocation} className="absolute right-3 top-3 text-blue-600 p-1 bg-blue-50 rounded-lg">
                    {isLocating ? <Loader2 size={18} className="animate-spin"/> : <Crosshair size={18}/>}
                  </button>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Search Now</button>
              </form>
              
              <Link href={dashboardLink} onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 rounded-xl font-bold border-2 border-blue-100 text-lg shadow-sm">
                <LayoutDashboard size={24} /> Dashboard
              </Link>

              {/* ✅ ADDED ORDERS TO MOBILE MENU */}
              {user?.role === 'buyer' && (
                <Link href="/buyer/orders" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-800 py-3 rounded-xl font-bold border border-gray-200">
                  <Package size={20} /> My Orders
                </Link>
              )}
              {user?.role === 'seller' && (
                <Link href="/seller/orders" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-800 py-3 rounded-xl font-bold border border-gray-200">
                  <Package size={20} /> Manage Orders
                </Link>
              )}

              {/* Login / Register Mobile */}
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold">
                      <LogIn size={20} /> Login
                  </Link>
                  <Link href="/register?role=seller" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md">
                    <User size={20} /> Become Seller
                  </Link>
                </div>
              )}

              <button onClick={() => { setIsPostReqOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-50 flex justify-center gap-2">
                <PlusCircle size={20} /> Post Buy Requirement
              </button>

              <div className="border-t border-gray-100 pt-2 space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">Menu</p>
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                    <HelpCircle size={18} /> How It Works
                </Link>
                <Link href="/buyer/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                  <MessageCircle size={18} /> Buyer Messages
                </Link>
                <Link href="/seller/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2">
                  <MessageCircle size={18} /> Seller Messages
                </Link>
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
          <p className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Megaphone className="text-blue-600 flex-shrink-0" size={16} />
            <span>Post your Requirement & Get Verified Sellers! (For all services including transportation, catering etc.) or Call- 91-8384049914</span>
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