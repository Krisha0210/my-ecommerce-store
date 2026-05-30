import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CreditCard, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [upiId, setUpiId] = useState('');

  // Safeguard: Redirect empty carts
  if (cartItems.length === 0 && !processing) {
    return <Navigate to="/cart" replace />;
  }

  const shipping = 0;
  const discountAmount = appliedCoupon ? parseFloat((cartSubtotal * (appliedCoupon.discountPercent / 100)).toFixed(2)) : 0;
  const discountedSubtotal = cartSubtotal - discountAmount;
  const tax = parseFloat((discountedSubtotal * 0.08).toFixed(2));
  const total = parseFloat((discountedSubtotal + shipping + tax).toFixed(2));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    setApplying(true);
    setCouponError('');
    try {
      const result = await api.validateCoupon(couponInput);
      if (result.valid) {
        setAppliedCoupon({
          code: couponInput.toUpperCase(),
          discountPercent: result.discountPercent
        });
        setCouponInput('');
      }
    } catch (err) {
      console.error(err);
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. username@bank).');
      setProcessing(false);
      return;
    }

    try {
      const shippingAddress = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        zip: formData.zip
      };
      
      const paymentDetails = 
        paymentMethod === 'Card'
          ? { cardName: formData.cardName, cardNumber: formData.cardNumber }
          : paymentMethod === 'UPI'
            ? { upiId }
            : null;

      // Register purchase on database
      const order = await api.createOrder(
        cartItems, 
        shippingAddress, 
        appliedCoupon ? appliedCoupon.code : null,
        paymentMethod,
        paymentDetails
      );
      
      // Simulate bank authorization processing delay
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { 
            orderId: order.id,
            orderDetails: order,
            items: cartItems,
            total: total
          }
        });
        clearCart();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment processing failed. Please verify item stock.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/10 bg-red-950/10 p-4 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          {/* Shipping addresses */}
          <div className="rounded-2xl glass p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Street Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Luxury Avenue"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  City
                </label>
                <input 
                  type="text" 
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Zip / Postal Code
                </label>
                <input 
                  type="text" 
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="10001"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-2xl glass p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Select Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'Card'
                    ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-semibold">Debit / Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-semibold">UPI Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-semibold">Cash on Delivery</span>
              </button>
            </div>
          </div>

          {/* Conditional Payment Input Fields */}
          {paymentMethod === 'Card' && (
            <div className="rounded-2xl glass p-6 animate-fade-in">
              <h3 className="text-base font-bold text-white mb-4">Secure Card Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Cardholder Name
                  </label>
                  <input 
                    type="text" 
                    name="cardName"
                    required={paymentMethod === 'Card'}
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Card Number
                  </label>
                  <input 
                    type="text" 
                    name="cardNumber"
                    required={paymentMethod === 'Card'}
                    maxLength="16"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="4111222233334444"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Expiration Date
                  </label>
                  <input 
                    type="text" 
                    name="cardExpiry"
                    required={paymentMethod === 'Card'}
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    CVV / Security Code
                  </label>
                  <input 
                    type="password" 
                    name="cardCvv"
                    required={paymentMethod === 'Card'}
                    maxLength="3"
                    value={formData.cardCvv}
                    onChange={handleChange}
                    placeholder="***"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="rounded-2xl glass p-6 animate-fade-in flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-white mb-2">UPI Transaction Details</h3>
                <p className="text-xs text-slate-400">Please enter your UPI Virtual Payment Address (VPA).</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  UPI ID (VPA)
                </label>
                <input 
                  type="text" 
                  name="upiId"
                  required={paymentMethod === 'UPI'}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="john@okaxis"
                  className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
                />
              </div>
              <div className="border border-slate-900/50 bg-slate-950/20 rounded-xl p-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white block mb-1">Simulated App Notification</span>
                  A payment request will be sent to your UPI app on checkout.
                </div>
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 border border-slate-800 shadow">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full bg-slate-950 rounded"></div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'COD' && (
            <div className="rounded-2xl glass p-6 animate-fade-in flex flex-col gap-4">
              <h3 className="text-base font-bold text-white">Cash on Delivery (COD)</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you for choosing Cash on Delivery. You will pay the total order value of <span className="font-extrabold text-indigo-400">${total.toFixed(2)}</span> in cash to our courier agent at the time of delivery.
              </p>
              <div className="bg-amber-950/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs leading-relaxed">
                <span className="font-bold block mb-1">Important Notice</span>
                Please prepare the exact cash amount ready for collection upon delivery to avoid delays.
              </div>
            </div>
          )}
        </form>

        {/* Calculations & Summary Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl glass p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-900">
              Your Order
            </h2>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Qty {item.quantity} &bull; ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Coupon Input */}
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Promo Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400">
                  <span>
                    Applied: <span className="font-mono font-bold">{appliedCoupon.code}</span> ({appliedCoupon.discountPercent}% Off)
                  </span>
                  <button 
                    type="button"
                    onClick={handleRemoveCoupon} 
                    className="text-[10px] uppercase font-black hover:text-white transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME10, VELOCE20..."
                    className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-slate-200 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    disabled={applying || !couponInput}
                    onClick={handleApplyCoupon}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <span className="text-[10px] text-rose-400 font-semibold">{couponError}</span>
              )}
            </div>

            <div className="border-t border-slate-900 pt-4 flex flex-col gap-2 text-xs font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">${cartSubtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-1 flex justify-between text-sm font-extrabold">
                <span className="text-white">Total</span>
                <span className="text-indigo-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={processing}
              className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Pay ${total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
