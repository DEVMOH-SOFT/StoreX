import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050a1c] text-slate-400 text-sm mt-16 border-t border-slate-800">
      {/* Trust Highlights */}
      <div className="border-b border-slate-800/80 bg-[#030714] py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Free Delivery</h4>
              <p className="text-xs text-slate-400">On all orders over ₦50,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Secure Payment</h4>
              <p className="text-xs text-slate-400">100% safe and encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">24/7 Support</h4>
              <p className="text-xs text-slate-400">We're here to help anytime</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Easy Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free within 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-block mb-4">
            <div className="relative h-10 sm:h-12 w-48">
              <Image
                src="/images/logo.png"
                alt="StoreX Logo"
                fill
                className="object-contain object-left brightness-200 contrast-125"
              />
            </div>
          </Link>
          <p className="text-xs leading-relaxed text-slate-400">
            StoreX is Nigeria's premier destination for genuine smart gadgets, laptops, smartphones, and cutting-edge tech accessories.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/products?category=Smartphones" className="hover:text-white transition-colors">Smartphones</Link></li>
            <li><Link href="/products?category=Laptops" className="hover:text-white transition-colors">Laptops</Link></li>
            <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Return Policy</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Warranty & Support</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Contact & Address</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            12 Freedom Street, Ikeja, Lagos State, Nigeria
          </p>
          <p className="text-xs text-slate-400">Email: support@storex.ng</p>
          <p className="text-xs text-slate-400">Phone: +234 801 234 5678</p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} StoreX Electronics Inc. All rights reserved.
      </div>
    </footer>
  );
}
