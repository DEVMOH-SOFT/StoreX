'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { formatNGN } from '@/data/products';

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your recent orders and track deliveries in real time.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No orders yet</h3>
          <p className="text-xs text-slate-500">When you place an order, it will show up here.</p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-indigo-200 transition-all"
            >
              {/* Top Order Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm mr-2">#{order.id}</span>
                  <span className="text-slate-400">Placed on {order.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'Out for Delivery'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatNGN(order.total)}
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Track Order Action Button */}
                <Link
                  href={`/orders/${order.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  Track Order <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
