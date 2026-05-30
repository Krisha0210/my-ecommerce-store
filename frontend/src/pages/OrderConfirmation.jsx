import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  // Trigger confetti fireworks on component load
  useEffect(() => {
    if (order) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [order]);

  // Safeguard: Redirect visitors accessing without order state
  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
      {/* Glowing Checkmark */}
      <div className="relative mb-8 text-emerald-400">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl"></div>
        <CheckCircle2 className="w-20 h-20 relative animate-scale-up" />
      </div>

      {/* Confirmation Header */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-2">
        Thank You for Your Order!
      </h1>
      <p className="text-sm text-slate-400 text-center max-w-md mb-8">
        {order.paymentMethod === 'Cash on Delivery' 
          ? 'Your order has been registered successfully. You will pay in cash upon package delivery.' 
          : 'Your payment was authorized successfully. We have sent a purchase confirmation invoice to your email.'}
      </p>

      {/* Invoice Details Card */}
      <div className="w-full rounded-2xl glass p-6 mb-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-900 text-sm">
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Order Reference</span>
            <span className="text-white font-mono font-bold">{order.id}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Payment Method</span>
            <span className="text-white font-bold">
              {order.paymentMethod === 'Card' ? 'Debit/Credit Card' : order.paymentMethod === 'UPI' ? 'UPI' : 'Cash on Delivery'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Payment Status</span>
            <span className={order.paymentMethod === 'Cash on Delivery' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {order.paymentMethod === 'Cash on Delivery' ? 'Pay on Delivery' : 'Payment Successful'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Estimated Delivery</span>
            <span className="text-white font-semibold">3-5 Business Days</span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="pb-4 border-b border-slate-900 text-sm">
          <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-2">Shipping Address</span>
          <p className="text-white font-medium">{order.shippingAddress.name}</p>
          <p className="text-slate-400 mt-0.5">{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zip}</p>
        </div>

        {/* Itemized summary */}
        <div>
          <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-3">Itemized Invoice</span>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-slate-300 font-medium truncate max-w-[250px]">{item.name}</span>
                  <span className="text-slate-500 text-xs font-semibold">x{item.quantity}</span>
                </div>
                <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order total */}
        <div className="border-t border-slate-900 pt-4 flex justify-between items-center font-extrabold text-base">
          <span className="text-white">Total Amount</span>
          <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Navigation triggers */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link 
          to="/products"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
