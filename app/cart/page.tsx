'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatNGN } from '@/data/products';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const deliveryFee = cart.length > 0 ? 2000 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore our collection of cutting-edge smartphones, laptops, audio tech, and gadgets to get started.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Cart
        </h1>
        <Link
          href="/products"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4 shadow-sm hover:border-slate-300 transition-all"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors truncate block"
                >
                  {item.product.name}
                </Link>
                {item.selectedColor && (
                  <p className="text-xs text-slate-400 mt-0.5">Color: {item.selectedColor}</p>
                )}
                <div className="font-extrabold text-slate-900 text-sm mt-1">
                  {formatNGN(item.product.price)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-1">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-xs"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-xs"
                >
                  +
                </button>
              </div>

              {/* Line Subtotal */}
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Subtotal</div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatNGN(item.product.price * item.quantity)}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-slate-900">{formatNGN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">{formatNGN(deliveryFee)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Total</span>
                <span className="font-extrabold text-indigo-600 text-lg sm:text-xl">
                  {formatNGN(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
