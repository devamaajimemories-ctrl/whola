"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LOGIC FIX: Dynamic Home Link ---
  // If logged in as Buyer -> Go to Buyer Dashboard
  // If logged in as Seller -> Go to Seller Dashboard
  // If not logged in -> Go to Public Home (/)
  const homeHref = session?.user?.role === 'seller' 
    ? '/seller/dashboard' 
    : session?.user?.role === 'buyer' 
      ? '/buyer/dashboard' 
      : '/';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. LOGO SECTION (Fixed Link) */}
          <div className="flex items-center">
            <Link href={homeHref} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="font-bold text-xl text-blue-900 tracking-tight">
                ExportIndia
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              href={homeHref}
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            <Link href="/search" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Browse Suppliers
            </Link>

            <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              How it Works
            </Link>

            {/* Auth Buttons */}
            {session ? (
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
                  onClick={() => signOut({ callbackUrl: '/' })}
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

          {/* 3. MOBILE MENU BUTTON */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href={homeHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Home
            </Link>
            
            <Link 
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Browse Suppliers
            </Link>

            {session ? (
              <>
                <Link 
                  href={homeHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col gap-2 px-3">
                <Link 
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}