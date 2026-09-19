import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const orderId = params.id.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 shadow-sm space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Thank you for choosing StoreX. Your order has been received and is being processed by our fulfillment center.
          </p>
        </div>

        {/* Order Number Badge */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 inline-block w-full max-w-xs mx-auto">
          <div className="text-xs text-slate-400 font-medium">Order Number</div>
          <div className="text-lg font-extrabold text-slate-900 tracking-wider mt-0.5">
            #{orderId}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={`/orders/${orderId}`}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
          >
            View Order Details <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
