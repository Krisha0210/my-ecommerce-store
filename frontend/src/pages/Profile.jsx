import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, Heart, Tag, HelpCircle, Copy, Search, ChevronDown, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  
  // Collapsed states for orders
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Help FAQ states
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const couponsList = [
    { code: 'WELCOME10', discount: '10% OFF', desc: 'Valid on your first order catalog wide.' },
    { code: 'VELOCE20', discount: '20% OFF', desc: 'Unlock 20% discount on orders exceeding $150.' },
    { code: 'SUPER50', discount: '50% OFF', desc: 'Limited time flash sale half price coupon.' }
  ];

  const faqs = [
    { q: "How do I track my delivery status?", a: "You can view estimated arrival milestones right under your 'My Orders' history dashboard. Shipments generally take 3-5 business days." },
    { q: "What is your refund policy?", a: "Veloce provides a 30-day money-back return policy on all pristine, original-packaging purchases. Reach out to our customer support to trigger a shipping slip." },
    { q: "Which payment channels do you support?", a: "We support major Credit/Debit Cards (Visa, Mastercard, Amex), UPI payment addresses, and Cash on Delivery (COD) processing." },
    { q: "Do you ship internationally?", a: "Currently, Veloce supports nationwide express delivery. We are working on expanding international logistics services soon." }
  ];

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        const history = await api.getOrders();
        setOrders(history.reverse()); // Newest first
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const loadWishlistAndCatalog = async () => {
      try {
        const catalog = await api.getProducts();
        setProducts(catalog);
        
        const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(catalog.filter(p => ids.includes(p.id)));
      } catch (err) {
        console.error(err);
      }
    };

    loadOrders();
    loadWishlistAndCatalog();

    // Listen to changes in wishlist from other pages
    const handleWishlistUpdate = () => {
      const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(prev => products.filter(p => ids.includes(p.id)));
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [user, products.length]);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
           faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  if (!user) {
    return <Navigate to="/login?redirect=profile" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account welcome header */}
      <div className="rounded-3xl glass p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/20 shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{user.email}</p>
          <span className="inline-block mt-3 text-xs font-semibold text-indigo-400 bg-indigo-950/30 border border-indigo-500/20 rounded-full px-3 py-1">
            Registered Member
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <aside className="lg:col-span-1 rounded-2xl glass p-4 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Package className="w-4.5 h-4.5" />
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Heart className="w-4.5 h-4.5" />
            My Wishlist
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Tag className="w-4.5 h-4.5" />
            Promo Coupons
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'help'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            Help Center
          </button>
        </aside>

        {/* Tab content panel */}
        <main className="lg:col-span-3">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-extrabold text-white mb-2">Order History</h2>
              
              {loadingOrders ? (
                <Loader />
              ) : orders.length === 0 ? (
                <div className="rounded-2xl glass p-12 text-center">
                  <p className="text-slate-400 font-medium mb-4">You haven't placed any orders yet.</p>
                  <Link to="/products" className="inline-block text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="rounded-2xl glass overflow-hidden border border-slate-900">
                      {/* Collapsed top view */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === ord.id ? null : ord.id)}
                        className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-4 hover:bg-slate-900/10 transition-colors"
                      >
                        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-8 gap-3 text-xs text-slate-400">
                          <div>
                            <span className="font-semibold block uppercase text-[10px] text-slate-500">Reference ID</span>
                            <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                          </div>
                          <div>
                            <span className="font-semibold block uppercase text-[10px] text-slate-500">Date</span>
                            <span className="text-slate-300 font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="font-semibold block uppercase text-[10px] text-slate-500">Total Price</span>
                            <span className="text-indigo-400 font-extrabold text-sm">${ord.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 border ${
                            ord.paymentStatus === 'Paid' 
                              ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' 
                              : 'text-amber-400 bg-amber-950/20 border-amber-500/20'
                          }`}>
                            {ord.paymentStatus === 'Paid' ? 'Paid' : 'Pending COD'}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${expandedOrder === ord.id ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Collapsible detail segment */}
                      {expandedOrder === ord.id && (
                        <div className="p-5 border-t border-slate-900 bg-slate-950/20 flex flex-col gap-5 animate-fade-in text-sm">
                          {/* Shipping address details */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Delivered to</span>
                            <p className="text-slate-300 font-semibold">{ord.shippingAddress.name}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{ord.shippingAddress.address}, {ord.shippingAddress.city} {ord.shippingAddress.zip}</p>
                          </div>

                          {/* Items invoice list */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Items Purchased</span>
                            <div className="flex flex-col gap-3">
                              {ord.items.map((item) => (
                                <div key={item.productId} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-slate-300 truncate max-w-[200px]">{item.name}</span>
                                    <span className="text-slate-500 text-xs">x{item.quantity}</span>
                                  </div>
                                  <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">My Wishlist</h2>
              <p className="text-sm text-slate-400 mb-6">Explore the items you have saved to purchase later.</p>

              {wishlistItems.length === 0 ? (
                <div className="rounded-2xl glass p-12 text-center">
                  <p className="text-slate-400 font-medium mb-4">Your wishlist is empty.</p>
                  <Link to="/products" className="inline-block text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow">
                    Browse Shop Catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Available Coupons</h2>
              <p className="text-sm text-slate-400 mb-6">Apply these promo codes during checkout to redeem discount benefits.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {couponsList.map((coupon) => (
                  <div key={coupon.code} className="rounded-2xl glass p-5 flex items-center justify-between border border-dashed border-slate-800 relative overflow-hidden">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{coupon.discount}</span>
                      <h3 className="text-lg font-extrabold text-white font-mono">{coupon.code}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">{coupon.desc}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        copiedCoupon === coupon.code
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Copy Coupon"
                    >
                      {copiedCoupon === coupon.code ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HELP CENTER TAB */}
          {activeTab === 'help' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-extrabold text-white mb-2">Help Center FAQs</h2>
                <p className="text-sm text-slate-400">Search for help queries or get in touch with Veloce customer care agents.</p>
              </div>

              {/* FAQ Search */}
              <div className="relative">
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
                <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>

              {/* FAQ Accordeon */}
              <div className="flex flex-col gap-3">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="rounded-xl glass border border-slate-900 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 text-left font-bold text-white text-sm flex items-center justify-between hover:bg-slate-900/10 transition-colors"
                    >
                      {faq.q}
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 border-t border-slate-900 bg-slate-950/20 text-xs text-slate-400 leading-relaxed animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Support Mock Form */}
              <div className="rounded-2xl glass p-6 mt-4">
                <h3 className="text-base font-bold text-white mb-2">Need Further Help?</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">Submit a help ticket below and our operations support staff will reach out in under 24 hours.</p>
                <form onSubmit={(e) => { e.preventDefault(); alert("Help ticket submitted successfully!"); }} className="flex flex-col gap-3">
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe your issue details here..."
                    className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    className="self-end bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow cursor-pointer"
                  >
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
