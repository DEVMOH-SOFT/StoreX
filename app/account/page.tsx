'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, MapPin, CreditCard, Heart, Headphones, Settings, LogOut, ArrowRight, User } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatNGN } from '@/data/products';
import { api } from '@/lib/api';

export default function AccountPage() {
  const { orders } = useOrders();
  const { wishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'wishlist'>('dashboard');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.account.getProfile();
        if (res.success && res.profile) {
          setProfile(res.profile);
        }
      } catch (err) {
        console.warn('[StoreX Account] Failed to fetch account profile from API:', err);
      }
    }

    loadProfile();
  }, []);

  const customerName = profile?.name || 'Muhammed Adegoke';
  const customerEmail = profile?.email || 'muhammed@example.com';
  const initials = customerName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const walletBalance = profile?.metrics?.walletBalance || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-base flex items-center justify-center shadow-md">
          {initials}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {customerName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500">{customerEmail} • Premium Member</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-200/80 p-4 space-y-1 shadow-sm h-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          <Link
            href="/orders"
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> My Orders ({orders.length})
          </Link>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" /> Addresses
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'wishlist' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4" /> Wishlist ({wishlist.length})
          </button>

          <div className="border-t border-slate-100 pt-2 space-y-1">
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2.5">
              <Headphones className="w-4 h-4" /> Support
            </button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2.5">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium">Total Orders</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalOrdersCount}</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium">Active Orders</div>
                  <div className="text-2xl font-extrabold text-indigo-600 mt-1">{activeOrdersCount}</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium">Wishlist Items</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{wishlist.length}</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium">Wallet Balance</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatNGN(walletBalance)}</div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
                  <Link href="/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">No recent orders yet.</p>
                  ) : (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">#{order.id}</div>
                          <div className="text-slate-400">{order.date} • {formatNGN(order.total)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {order.status}
                          </span>
                          <Link href={`/orders/${order.id}`} className="text-indigo-600 font-bold hover:underline">
                            Track
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Saved Shipping Addresses
              </h3>
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1 text-xs">
                <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">Default</span>
                <h4 className="font-bold text-slate-900 text-sm pt-1">{profile?.address?.fullName || customerName}</h4>
                <p className="text-slate-600">{profile?.address?.address || '12, Freedom Street, Ikeja'}, {profile?.address?.city || 'Ikeja'}, {profile?.address?.state || 'Lagos'}, Nigeria</p>
                <p className="text-slate-500">Phone: {profile?.address?.phone || '+234 801 234 5678'}</p>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Your Saved Wishlist ({wishlist.length})
              </h3>
              {wishlist.length === 0 ? (
                <p className="text-xs text-slate-500">No items saved in wishlist yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="p-3 border rounded-xl flex items-center gap-3">
                      <div className="font-bold text-xs text-slate-900 flex-1">{item.name}</div>
                      <Link href={`/products/${item.id}`} className="text-xs font-bold text-indigo-600">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
