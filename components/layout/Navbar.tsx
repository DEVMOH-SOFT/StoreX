'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Official StoreX Brand Logo - Increased Size */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative h-10 sm:h-12 w-44 sm:w-52">
              <Image
                src="/images/logo.png"
                alt="StoreX Logo"
                fill
                priority
                className="object-contain object-left scale-105"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-700">
            <Link href="/" className="hover:text-[#0d2d9e] transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-[#0d2d9e] transition-colors">
              Products
            </Link>
            <Link href="/products?category=Smartphones" className="hover:text-[#0d2d9e] transition-colors">
              Categories
            </Link>
            <Link href="/products?deals=true" className="hover:text-[#0d2d9e] transition-colors text-[#0d2d9e] font-extrabold">
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for gadgets, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d2d9e] focus:border-transparent transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 p-1.5 text-slate-600 hover:text-[#0d2d9e] transition-colors"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5" />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalWishlist}
                  </span>
                )}
              </div>
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-slate-700 hover:text-[#0d2d9e] transition-colors flex items-center gap-1.5"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#0d2d9e] text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Customer Profile Avatar */}
            <Link href="/account" className="flex items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#050a1c] text-white font-extrabold text-xs flex items-center justify-center hover:bg-[#0d2d9e] transition-colors shadow-sm">
                MA
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Field */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search gadgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d2d9e]"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-bold hover:text-[#0d2d9e]"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-bold hover:text-[#0d2d9e]"
          >
            Products
          </Link>
          <Link
            href="/products?category=Smartphones"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-bold hover:text-[#0d2d9e]"
          >
            Categories
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-bold hover:text-[#0d2d9e]"
          >
            My Orders & Tracking
          </Link>
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-bold hover:text-[#0d2d9e]"
          >
            My Account
          </Link>
        </div>
      )}
    </header>
  );
}
