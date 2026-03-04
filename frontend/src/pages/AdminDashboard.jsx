// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI, orderAPI, shopAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Download,
  QrCode, Store, CheckCircle, Clock, Truck, XCircle, ChevronRight,
  Cpu, Search, Filter, RefreshCw
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
// LAYOUT & NAV
// ════════════════════════════════════════════════════════════

function AdminLayout({ children }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', end: true },
    { to: '/admin/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
    { to: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders' },
    { to: '/admin/shops', icon: <Store className="w-5 h-5" />, label: 'Shops' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-none">
                DAH <span className="text-blue-400">TECH</span>
              </h1>
              <p className="text-slate-500 text-xs font-mono">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-white text-sm font-medium">{username}</p>
              <p className="text-slate-500 text-xs">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ════════════════════════════════════════════════════════════

function OverviewPage() {
  const [stats, setStats] = useState({ available: 0, soldOnline: 0, soldLocally: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.getStats(),
      orderAPI.getAll(0, 5),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.content || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Available Items', value: stats.available, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: <Package className="w-6 h-6 text-green-400" /> },
    { label: 'Sold Online', value: stats.soldOnline, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <ShoppingCart className="w-6 h-6 text-blue-400" /> },
    { label: 'Sold Locally (QR)', value: stats.soldLocally, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <QrCode className="w-6 h-6 text-amber-400" /> },
  ];

  const orderStatusColor = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    DRIVER_DISPATCHED: 'bg-blue-500/20 text-blue-400',
    PICKED_UP: 'bg-cyan-500/20 text-cyan-400',
    OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-slate-400 text-sm mt-1">Dah Tech marketplace at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`border rounded-2xl p-6 ${card.bg}`}>
            <div className="flex items-center justify-between mb-4">
              {card.icon}
              <span className={`text-4xl font-black ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-semibold text-white">Recent Orders</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm text-center">No orders yet</p>
          ) : recentOrders.map((order) => (
            <div key={order.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{order.productName}</p>
                <p className="text-slate-400 text-xs mt-1">{order.customerName} · {order.city}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-mono ${orderStatusColor[order.orderStatus]}`}>
                  {order.orderStatus.replace('_', ' ')}
                </span>
                <span className="text-slate-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-SA')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// INVENTORY PAGE — The crown jewel with QR codes
// ════════════════════════════════════════════════════════════

const CATEGORIES = ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PSU', 'Case', 'Cooling', 'Other'];
const CONDITIONS = ['Excellent', 'Good', 'Fair'];

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // for QR modal
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, shopRes] = await Promise.all([
        productAPI.getAll(page),
        shopAPI.getAll(),
      ]);
      setProducts(prodRes.data.content || []);
      setTotalPages(prodRes.data.totalPages || 0);
      setShops(shopRes.data || []);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const statusBadge = {
    AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
    SOLD_ONLINE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SOLD_LOCALLY: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage products and download QR codes for partner shops
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                     font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <AddProductModal
          shops={shops}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => { setShowAddForm(false); fetchProducts(); }}
        />
      )}

      {/* QR Code Modal */}
      {selectedProduct && (
        <QrCodeModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Products Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">Shop</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-xs uppercase tracking-widest">QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{p.condition} · {p.warrantyDays}d warranty</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-xs font-mono">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {p.price.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 text-xs">{p.shopName}</p>
                    <p className="text-slate-500 text-xs">{p.shopLocation}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-mono border ${statusBadge[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View QR
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No products yet. Add your first product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-mono transition ${
                    page === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Product Modal ─────────────────────────────────────────

function AddProductModal({ shops, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', category: 'GPU', price: '', condition: 'Excellent',
    warrantyDetails: '30-day replacement guarantee', warrantyDays: 30,
    description: '', imageUrl: '', shopId: shops[0]?.id || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productAPI.create({ ...form, price: parseFloat(form.price) });
      toast.success('Product added with QR code!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally { setLoading(false); }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h3 className="font-bold text-white text-lg">Add New Product</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <Field label="Product Name">
            <Input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g., NVIDIA RTX 3070 8GB" required />
          </Field>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Condition">
              <Select value={form.condition} onChange={e => set('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>

          {/* Price & Warranty */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (SAR)">
              <Input type="number" step="0.01" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="750.00" required />
            </Field>
            <Field label="Warranty (days)">
              <Input type="number" value={form.warrantyDays}
                onChange={e => set('warrantyDays', parseInt(e.target.value))} placeholder="30" />
            </Field>
          </div>

          {/* Warranty Details */}
          <Field label="Warranty Details">
            <Input value={form.warrantyDetails}
              onChange={e => set('warrantyDetails', e.target.value)}
              placeholder="30-day replacement guarantee" />
          </Field>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Additional details about this item..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 resize-none"
            />
          </Field>

          {/* Shop */}
          <Field label="Partner Shop">
            <Select value={form.shopId} onChange={e => set('shopId', parseInt(e.target.value))} required>
              <option value="">Select shop...</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.shopName} — {s.location}</option>)}
            </Select>
          </Field>

          {/* Note about QR */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <QrCode className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-xs leading-relaxed">
              A unique QR code will be automatically generated for this product. Download it
              and give it to the partner shop to enable instant sold-locally marking.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3 text-sm font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white
                         rounded-xl py-3 text-sm font-semibold transition flex items-center justify-center gap-2">
              {loading ? <Spinner /> : <><Plus className="w-4 h-4" /> Add Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── QR Code Modal ─────────────────────────────────────────────

function QrCodeModal({ product, onClose }) {
  const downloadUrl = productAPI.qrDownloadUrl(product.id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">QR Code</h3>
            <p className="text-slate-400 text-xs mt-0.5">Give this to the partner shop</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl">×</button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* QR Image */}
          {product.qrCodeBase64 ? (
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
              <img
                src={`data:image/png;base64,${product.qrCodeBase64}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <p className="text-slate-500 text-xs">No QR code</p>
            </div>
          )}

          {/* Product info */}
          <p className="text-white font-semibold text-center mb-1">{product.name}</p>
          <p className="text-slate-400 text-xs text-center mb-1">{product.shopName}</p>

          {/* Instructions */}
          <div className="bg-slate-800 rounded-xl p-4 w-full mt-4 mb-4">
            <p className="text-slate-300 text-xs leading-relaxed text-center">
              📱 When the shop sells this item to a walk-in customer, scan this QR code to
              instantly remove it from the Dah Tech website.
            </p>
          </div>

          {/* Download Button */}
          <a
            href={downloadUrl}
            download={`dahtech-qr-product-${product.id}.png`}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500
                       text-white font-semibold rounded-xl py-3 text-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download QR Code (PNG)
          </a>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ORDERS PAGE
// ════════════════════════════════════════════════════════════

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll(0, 50, statusFilter || undefined);
      setOrders(res.data.content || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Order updated!');
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  const statusConfig = {
    PENDING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" /> },
    DRIVER_DISPATCHED: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Driver Dispatched', icon: <Truck className="w-3.5 h-3.5" /> },
    PICKED_UP: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', label: 'Picked Up', icon: <Package className="w-3.5 h-3.5" /> },
    OUT_FOR_DELIVERY: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Out for Delivery', icon: <Truck className="w-3.5 h-3.5" /> },
    DELIVERED: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Delivered', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    CANCELLED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled', icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  const nextStatus = {
    PENDING: 'DRIVER_DISPATCHED',
    DRIVER_DISPATCHED: 'PICKED_UP',
    PICKED_UP: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-slate-400 text-sm mt-1">Dispatch drivers to partner shops</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.keys(statusConfig).map(s => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition">
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No orders found</p>
            </div>
          ) : orders.map((order) => {
            const sc = statusConfig[order.orderStatus] || statusConfig.PENDING;
            const ns = nextStatus[order.orderStatus];
            return (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-6">
                    {/* Product info */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">Product</p>
                      <p className="text-white font-semibold">{order.productName}</p>
                      <p className="text-slate-400 text-xs">{order.productCategory} · {
                        order.productPrice?.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })
                      }</p>
                    </div>

                    {/* Shop to collect from */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-xs text-amber-400 uppercase tracking-widest mb-1 font-mono flex items-center gap-1">
                        <Store className="w-3 h-3" /> Collect From
                      </p>
                      <p className="text-white font-medium text-sm">{order.shopName}</p>
                      <p className="text-slate-400 text-xs">{order.shopLocation}</p>
                      <p className="text-amber-300/70 text-xs mt-1">📞 {order.shopContact}</p>
                    </div>

                    {/* Deliver to */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">Deliver To</p>
                      <p className="text-white font-medium text-sm">{order.customerName}</p>
                      <p className="text-slate-400 text-xs">{order.shippingAddress}</p>
                      <p className="text-slate-400 text-xs">{order.city}</p>
                      <p className="text-blue-300/70 text-xs mt-1">📱 {order.customerPhone}</p>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                    <p className="text-slate-500 text-xs font-mono">
                      #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-SA')}
                    </p>
                    {ns && (
                      <button
                        onClick={() => updateStatus(order.id, ns)}
                        className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30
                                   text-blue-400 text-xs px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        {statusConfig[ns]?.icon}
                        → {statusConfig[ns]?.label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    >
      {children}
    </select>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

// ════════════════════════════════════════════════════════════
// ROOT ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="shops" element={<div className="p-8 text-slate-400">Shop management coming soon...</div>} />
      </Routes>
    </AdminLayout>
  );
}
