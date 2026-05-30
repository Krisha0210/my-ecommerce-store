import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = 0;
  const tax = parseFloat((cartSubtotal * 0.08).toFixed(2));
  const total = parseFloat((cartSubtotal + shipping + tax).toFixed(2));

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-6">
        <div className="p-5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Your Cart is Empty</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Looks like you haven't added any products to your shopping cart yet. Let's find some premium gear.
          </p>
        </div>
        <Link 
          to="/products"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/15"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => (
            <div 
              key={item.productId} 
              className="rounded-2xl glass p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
            >
              {/* Product Image Link */}
              <Link to={`/products/${item.productId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Title & Price descriptions */}
              <div className="flex-grow min-w-0">
                <h3 className="text-base font-bold text-white line-clamp-1 hover:text-indigo-400 transition-colors">
                  <Link to={`/products/${item.productId}`}>{item.name}</Link>
                </h3>
                <p className="text-sm font-semibold text-slate-400 mt-1">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              {/* Quantity selectors */}
              <div className="flex items-center bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-bold text-white min-w-8 text-center">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white font-bold transition-colors"
                >
                  +
                </button>
              </div>

              {/* Item Line Total */}
              <div className="text-right min-w-[80px]">
                <span className="font-extrabold text-white text-base">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Remove button */}
              <button 
                onClick={() => removeFromCart(item.productId)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Catalog return button */}
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white mt-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-1 rounded-2xl glass p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-900 pb-4">
            Order Summary
          </h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white font-semibold">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span className="text-emerald-400 font-bold">Free</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (8%)</span>
              <span className="text-white font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-900 pt-3 mt-1 flex justify-between text-base font-extrabold">
              <span className="text-white">Total</span>
              <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
