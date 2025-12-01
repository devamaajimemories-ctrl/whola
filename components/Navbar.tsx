"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, ShoppingBag, LayoutDashboard, Search, PlusCircle, ChevronDown } from 'lucide-react';
import PostRequirementModal from '@/components/PostRequirementModal';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostReqOpen, setIsPostReqOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customUser, setCustomUser] = useState<any>(null);

  // Fetch Custom Auth Session
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

  // Combine NextAuth session and Custom Auth user
  const user = session?.user || customUser;

  // Determine Dashboard Link based on role
  const homeHref = user?.role === 'seller'
    ? '/seller/dashboard'
    : user?.role === 'buyer'
      ? '/buyer/dashboard'
      : '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  const handleLogout = async () => {
    // 1. Clear Custom Cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    // 2. Clear NextAuth Session
    await signOut({ redirect: false });
    // 3. Redirect to Home
    window.location.href = '/';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">

            {/* 1. LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={homeHref} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
                  E
                </div>
                <span className="font-bold text-xl text-blue-900 tracking-tight hidden sm:block">
                  ExportIndia
                </span>
              </Link>
            </div>

            {/* 2. SEARCH BOX (Centered) */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search products, suppliers, services..."
                  className="w-full pl-5 pr-12 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all group-hover:bg-white group-hover:shadow-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* 3. DESKTOP ACTIONS */}
            <div className="hidden md:flex md:items-center md:space-x-6">

              {/* For Buyer Dropdown */}
              <div className="relative group h-16 flex items-center">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                  For Buyers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[95%] right-0 w-52 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-2 transform transition-all origin-top-right">
                  <button onClick={() => setIsPostReqOpen(true)} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Post Requirement
                  </button>
                  <Link href="/search" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Browse Suppliers
                  </Link>
                  <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    How It Works
                  </Link>
                </div>
              </div>

              {/* For Seller Dropdown */}
              <div className="relative group h-16 flex items-center">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                  For Sellers <ChevronDown size={14} />
                </button>
                <div className="absolute top-[95%] right-0 w-52 bg-white shadow-xl rounded-xl border border-gray-100 hidden group-hover:block p-2 transform transition-all origin-top-right">
                  <Link href="/register?role=seller" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Sell on ExportIndia
                  </Link>
                  <Link href="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Seller Login
                  </Link>
                  <Link href="/seller/pricing" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium">
                    Membership Plans
                  </Link>
                </div>
              </div>

              {/* Post Requirement Button */}
              <button
                onClick={() => setIsPostReqOpen(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <PlusCircle size={16} /> Post Buy Req
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <Link
                    href={homeHref}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>

                  <div className="h-6 w-px bg-gray-300"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-4">
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>

            {/* 4. MOBILE MENU TOGGLE */}
            <div className="flex items-center md:hidden gap-4">
              <button onClick={() => setIsPostReqOpen(true)} className="text-red-600">
                <PlusCircle size={24} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* 5. MOBILE MENU CONTENT */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-3 text-gray-500">
                <Search size={20} />
              </button>
            </form>

            <button onClick={() => { setIsPostReqOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-transform flex justify-center gap-2">
              <PlusCircle size={20} /> Post Buy Requirement
            </button>

            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">For Buyers</p>
              <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium">Browse Suppliers</Link>
              <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium">How It Works</Link>
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">For Sellers</p>
              <Link href="/register?role=seller" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium">Sell on ExportIndia</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium">Seller Login</Link>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <>
                  <Link href={homeHref} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-blue-50 text-blue-700 py-3 rounded-lg font-bold mb-2">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-center text-red-600 font-bold py-2">Logout</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md">Sign In / Register</Link>
              )}
            </div>
          </div>
        )}
      </nav >

      {/* Global Post Requirement Modal */}
      <PostRequirementModal isOpen={isPostReqOpen} onClose={() => setIsPostReqOpen(false)} />
    </>
  );
}