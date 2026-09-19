import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { OrderProvider } from '@/context/OrderContext';

export const metadata: Metadata = {
  title: 'StoreX | Smart Gadgets. Better Living.',
  description: 'Discover the latest smart gadgets, smartphones, laptops, audio tech, and accessories at StoreX.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <Navbar />
              <main className="flex-grow pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileNav />
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
