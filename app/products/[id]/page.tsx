'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { formatNGN } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.products.getById(params.id);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.image);
          if (res.product.colors && res.product.colors.length > 0) {
            setSelectedColor(res.product.colors[0].name);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d2d9e] mx-auto" />
        <p className="text-xs text-slate-500">Loading gadget specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The gadget you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#0d2d9e] hover:bg-[#1142d4] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-slate-900">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-900">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              fill
              priority
              className="object-contain p-6 transition-all duration-300"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition-all ${
                    selectedImage === img ? 'border-[#0d2d9e] ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} thumb ${idx}`} fill className="object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-50 text-[#0d2d9e] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.inStock && (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  In Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNGN(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm font-medium text-slate-400 line-through">
                {formatNGN(product.oldPrice)}
              </span>
            )}
            {product.discountBadge && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md">
                Save {product.discountBadge}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Color: <span className="text-[#0d2d9e]">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      selectedColor === c.name
                        ? 'border-[#0d2d9e] bg-blue-50 text-[#0d2d9e] ring-2 ring-blue-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Specifications Table */}
          {product.specs && product.specs.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Key Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-slate-400 font-medium">{spec.name}</span>
                    <span className="text-slate-900 font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0d2d9e] hover:bg-[#1142d4] text-white shadow-blue-900/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Delivery Highlights */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#0d2d9e]" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#0d2d9e]" />
              <span>Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#0d2d9e]" />
              <span>Easy 7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
