// src/pages/Storefront.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import {
  Cpu, Search, ShoppingCart, X, Shield, Star,
  ChevronDown, Zap, Package, Filter
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════════════════════════

function Navbar({ onCartOpen, cartCount }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-xl tracking-tight">
            DAH <span className="text-blue-400">TECH</span>
          </span>
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-0.5 rounded-full font-mono">
            ✓ GUARANTEED
          </span>
        </div>

        {/* Cart */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-700
                     border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs
                             rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 px-6">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300
                        text-xs font-mono px-4 py-2 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Saudi Arabia's Guaranteed Used PC Parts
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
          Upgrade Your Build.<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Guaranteed Quality.
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Every part comes with a warranty. Sourced from verified local shops across Saudi Arabia.
          Instant removal if sold in-store — your order is always accurate.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-10">
          {[
            { icon: <Shield className="w-4 h-4 text-green-400" />, text: 'Warranty on every item' },
            { icon: <Zap className="w-4 h-4 text-blue-400" />, text: 'Real-time availability' },
            { icon: <Package className="w-4 h-4 text-amber-400" />, text: 'Same-day dispatch' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-slate-400 text-sm">
              {icon}
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// FILTERS SIDEBAR
// ════════════════════════════════════════════════════════════

const CATEGORIES = ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PSU', 'Case', 'Cooling'];

function Filters({ filters, onChange }) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-white text-sm">Filters</h3>
        </div>

        {/* Category */}
        <div className="mb-6">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Category</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="category" value=""
                checked={!filters.category}
                onChange={() => onChange('category', '')}
                className="accent-blue-500" />
              <span className="text-slate-300 text-sm group-hover:text-white transition">All Categories</span>
            </label>
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="category" value={cat}
                  checked={filters.category === cat}
                  onChange={() => onChange('category', cat)}
                  className="accent-blue-500" />
                <span className="text-slate-300 text-sm group-hover:text-white transition">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Price (SAR)</p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={e => onChange('minPrice', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm
                         placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={e => onChange('maxPrice', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm
                         placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => onChange('reset')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm transition"
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════
// PRODUCT CARD
// ════════════════════════════════════════════════════════════

function ProductCard({ product, onAddToCart }) {
  const conditionColor = {
    Excellent: 'text-green-400 bg-green-500/10 border-green-500/20',
    Good: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Fair: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }[product.condition] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl overflow-hidden
                    transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      {/* Image area */}
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Cpu className="w-12 h-12 text-slate-700" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-slate-950/80 backdrop-blur text-slate-300 text-xs px-2 py-1 rounded-lg font-mono">
            {product.category}
          </span>
        </div>
        {/* Guaranteed badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-green-500/90 backdrop-blur text-white text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> GUARANTEED
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-white font-semibold text-base leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Condition & Warranty */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${conditionColor}`}>
            {product.condition}
          </span>
          <span className="text-xs text-slate-500">
            {product.warrantyDays}d warranty
          </span>
        </div>

        {/* Shop info */}
        <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
          📍 {product.shopName}, {product.shopLocation}
        </p>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <span className="text-white font-black text-xl">
            {product.price?.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                       text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CART SIDEBAR
// ════════════════════════════════════════════════════════════

function CartSidebar({ isOpen, onClose }) {
  const { cartItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 z-50
                      flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white">Your Cart</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!cartItem ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart item */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{cartItem.name}</p>
                    <p className="text-slate-400 text-xs mt-1">{cartItem.category} · {cartItem.condition}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 text-xs">{cartItem.warrantyDetails}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      📍 {cartItem.shopName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">
                      {cartItem.price?.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                    </p>
                    <button
                      onClick={clearCart}
                      className="text-red-400/60 hover:text-red-400 text-xs transition mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold
                             rounded-xl py-4 text-sm transition active:scale-95"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <CheckoutForm
                  product={cartItem}
                  onSuccess={() => { clearCart(); onClose(); }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// CHECKOUT FORM
// ════════════════════════════════════════════════════════════

function CheckoutForm({ product, onSuccess }) {
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    shippingAddress: '', city: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Taif', 'Abha'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderAPI.place({ ...form, productId: product.id });
      toast.success('🎉 Order placed! We\'ll contact you shortly.');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'This item may have just been sold. Please try another.';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Delivery Details</p>

      <input type="text" placeholder="Full Name *" required value={form.customerName}
        onChange={e => set('customerName', e.target.value)} className={inputCls} />

      <input type="tel" placeholder="Phone Number * (e.g. 0512345678)" required value={form.customerPhone}
        onChange={e => set('customerPhone', e.target.value)} className={inputCls} />

      <input type="email" placeholder="Email (optional)" value={form.customerEmail}
        onChange={e => set('customerEmail', e.target.value)} className={inputCls} />

      <textarea placeholder="Full Address *" required value={form.shippingAddress}
        onChange={e => set('shippingAddress', e.target.value)} rows={2}
        className={inputCls + ' resize-none'} />

      <select required value={form.city} onChange={e => set('city', e.target.value)} className={inputCls}>
        <option value="">Select City *</option>
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <textarea placeholder="Notes for driver (optional)" value={form.notes}
        onChange={e => set('notes', e.target.value)} rows={2}
        className={inputCls + ' resize-none'} />

      <button type="submit" disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white
                   font-bold rounded-xl py-4 text-sm transition active:scale-95 flex items-center justify-center gap-2">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
          : <>✓ Confirm Order</>
        }
      </button>
    </form>
  );
}

const inputCls = `w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`;

// ════════════════════════════════════════════════════════════
// MAIN STOREFRONT PAGE
// ════════════════════════════════════════════════════════════

export default function Storefront() {
  const { addToCart, itemCount, isOpen, setIsOpen } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size: 12,
        ...(search && { search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      };
      const res = await productAPI.getPublic(params);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ category: '', minPrice: '', maxPrice: '' });
      setSearch('');
    } else {
      setFilters(f => ({ ...f, [key]: value }));
    }
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar onCartOpen={() => setIsOpen(true)} cartCount={itemCount} />
      <Hero />

      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search bar */}
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search for GPU, CPU, RAM..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl
                       pl-11 pr-4 py-4 text-sm placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-8">
          {/* Filters */}
          <Filters filters={filters} onChange={handleFilterChange} />

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">No products found</p>
                <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-sm mb-6">
                  {products.length} item{products.length !== 1 ? 's' : ''} available
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 rounded-xl text-sm font-mono transition ${
                          page === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white">DAH <span className="text-blue-400">TECH</span></span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2024 Dah Tech. All PC parts are verified & guaranteed. Saudi Arabia.
          </p>
        </div>
      </footer>
    </div>
  );
}
