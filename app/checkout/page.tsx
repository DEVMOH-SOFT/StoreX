'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Building2, Wallet, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { formatNGN } from '@/data/products';
import { DeliveryAddress, DeliveryMethodType, PaymentMethodType } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: 'Muhammed Adegoke',
    phone: '+234 801 234 5678',
    email: 'muhammed@example.com',
    address: '12, Freedom Street, Ikeja',
    city: 'Ikeja',
    state: 'Lagos',
    postalCode: '100001',
  });

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('standard');
  const deliveryFee = deliveryMethod === 'express' ? 4000 : deliveryMethod === 'pickup' ? 0 : 2000;

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = createOrder({
        items: cart.length > 0 ? cart : [
          // Fallback if testing with direct checkout
        ],
        subtotal,
        deliveryFee,
        discount: 0,
        address,
        deliveryMethod,
        paymentMethod,
      });

      clearCart();
      setIsProcessing(false);
      router.push(`/orders/${newOrder.id}/success`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Stepper */}
      <div className="max-w-xl mx-auto flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10" />

        {/* Step 1 */}
        <div className="flex items-center gap-2 bg-white px-3">
          <div
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-bold ${step >= 1 ? 'text-indigo-600' : 'text-slate-500'}`}>
            Shipping
          </span>
        </div>

        {/* Step 2 */}
        <div className="flex items-center gap-2 bg-white px-3">
          <div
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-bold ${step >= 2 ? 'text-indigo-600' : 'text-slate-500'}`}>
            Payment
          </span>
        </div>

        {/* Step 3 */}
        <div className="flex items-center gap-2 bg-white px-3">
          <div
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-bold ${step >= 3 ? 'text-indigo-600' : 'text-slate-500'}`}>
            Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <select
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja (FCT)</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Kano">Kano</option>
                  </select>
                </div>
              </div>

              {/* Delivery Methods */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Delivery Method
                </h3>
                <div className="space-y-3">
                  <label
                    onClick={() => setDeliveryMethod('standard')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'standard' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {deliveryMethod === 'standard' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Standard Delivery (2–4 days)</div>
                        <div className="text-[11px] text-slate-500">Delivered directly to your door</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">₦2,000</span>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('express')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'express' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {deliveryMethod === 'express' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Express Delivery (1–2 days)</div>
                        <div className="text-[11px] text-slate-500">Fast priority dispatch</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">₦4,000</span>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {deliveryMethod === 'pickup' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Pickup at Store</div>
                        <div className="text-[11px] text-slate-500">Collect at Ikeja Flagship Store</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">Free</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">Select Payment Method</h2>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Simulated Demo Payment
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Card
                </button>

                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  Bank Transfer
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  Wallet
                </button>
              </div>

              {/* Form details per method */}
              {paymentMethod === 'card' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="5399 •••• •••• 4281"
                      defaultValue="5399 4812 9042 4281"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/28"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="842"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Simulated StoreX Bank Account</p>
                  <p className="text-slate-600">Bank Name: StoreX Zenith Bank Demo</p>
                  <p className="text-slate-600 font-mono text-sm font-bold text-indigo-700">
                    Account: 1048294820
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Transfers are automatically verified in this competition demo mode.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Review Your Order
              </h2>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Deliver to:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {address.fullName} ({address.phone})<br />
                    {address.address}, {address.city}, {address.state}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Payment Method:</span>
                  <span className="font-bold text-slate-900 capitalize">{paymentMethod} (Simulated)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Delivery:</span>
                  <span className="font-bold text-slate-900 uppercase">{deliveryMethod} delivery</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    'Processing Simulated Payment...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Pay {formatNGN(total)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            {/* Cart Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-slate-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-slate-900">
                    {formatNGN(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
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

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Your information is secure and encrypted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
