'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, MapPin, Phone, Truck, Loader2 } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { formatNGN } from '@/data/products';
import { api } from '@/lib/api';
import { Order } from '@/types';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(getOrderById(params.id) || null);
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    async function fetchLiveOrder() {
      try {
        const res = await api.orders.getById(params.id);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.warn(`[StoreX OrderTracking] Could not fetch live order ${params.id}:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d2d9e] mx-auto" />
        <p className="text-xs text-slate-500">Retrieving live shipment tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't find order #{params.id}.</p>
        <Link href="/orders" className="text-[#0d2d9e] font-semibold text-xs hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  const { delivery } = order;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/orders" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Track Your Order
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Order <span className="font-bold text-slate-900">#{order.id}</span> • Placed on {order.date}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0d2d9e] border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-[#0d2d9e] animate-pulse" />
          {order.status}
        </span>
      </div>

      {/* Progress Timeline Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-8">
        {/* Desktop Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-[#0d2d9e] transition-all duration-500"
                style={{
                  width:
                    order.status === 'Delivered'
                      ? '100%'
                      : order.status === 'Out for Delivery'
                      ? '66%'
                      : order.status === 'Shipped'
                      ? '50%'
                      : '25%',
                }}
              />
            </div>

            {delivery.events.map((event, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    event.completed
                      ? 'bg-[#0d2d9e] border-[#0d2d9e] text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {event.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-2">{event.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Delivery Status
          </h3>
          <div className="space-y-4 border-l-2 border-slate-200 pl-4">
            {delivery.events.map((event, idx) => (
              <div key={idx} className="relative">
                <div
                  className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 ${
                    event.completed ? 'bg-[#0d2d9e] border-[#0d2d9e]' : 'bg-white border-slate-300'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900">{event.title}</div>
                <div className="text-[11px] text-slate-500">{event.description}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Carrier Card */}
        <div className="bg-[#050a1c] text-white rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d2d9e] flex items-center justify-center text-white flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Your package is on the way</div>
              <div className="text-sm font-bold text-white">
                Estimated Delivery: {delivery.estimatedDelivery}
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            <div>Carrier: {delivery.provider}</div>
            <div>Tracking #: {delivery.trackingNumber}</div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Delivery Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 text-slate-700">
              <MapPin className="w-4 h-4 text-[#0d2d9e] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Delivery Address</div>
                <div>{delivery.address.fullName}</div>
                <div>{delivery.address.address}, {delivery.address.city}, {delivery.address.state}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-[#0d2d9e] flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Phone Number</div>
                <div>{delivery.address.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Ordered Items ({order.items.length})
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <div className="relative w-10 h-10 rounded bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                  <div className="text-slate-400">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold text-slate-900">
                  {formatNGN(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline text-xs">
            <span className="font-bold text-slate-900">Total Paid</span>
            <span className="font-extrabold text-[#0d2d9e] text-sm">{formatNGN(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
