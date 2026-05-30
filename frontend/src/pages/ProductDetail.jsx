import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const images = product ? (product.images && product.images.length > 0 ? product.images : [product.image]) : [];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <Loader fullPage={true} />;

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-500/10 bg-red-950/10 p-12 inline-block">
          <p className="text-red-400 font-semibold mb-4">{error || 'Product not found.'}</p>
          <Link to="/products" className="text-indigo-400 font-medium hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Image Carousel */}
        <div className="flex flex-col gap-4">
          <div className="relative rounded-3xl glass overflow-hidden aspect-square bg-slate-900 glow-primary group">
            {/* Main Image */}
            <img 
              src={images[activeImageIndex]} 
              alt={`${product.name} - view ${activeImageIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-indigo-600 hover:text-white text-slate-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-indigo-600 hover:text-white text-slate-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Pagination Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'bg-indigo-500 w-4' : 'bg-slate-500/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden glass border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx 
                      ? 'border-indigo-500 glow-primary scale-95' 
                      : 'border-slate-800/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Panel */}
        <div className="flex flex-col">
          {/* Category */}
          <div className="mb-4">
            <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-700'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-300">
              {product.rating} / 5.0
            </span>
            <span className="text-xs text-slate-500 font-medium ml-2">
              (48 Reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-slate-900">
            <span className="text-3xl font-black text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Availability & Actions */}
          <div className="mb-8 p-5 rounded-2xl glass flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Availability</span>
              {product.stock > 10 ? (
                <span className="text-emerald-400 font-bold">In Stock ({product.stock})</span>
              ) : product.stock > 0 ? (
                <span className="text-amber-400 font-bold">Low Stock ({product.stock} left)</span>
              ) : (
                <span className="text-rose-400 font-bold">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                {/* Quantity selector increment/decrement */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Quantity</span>
                  <div className="flex items-center bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-slate-400 hover:text-white font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-white min-w-10 text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 text-slate-400 hover:text-white font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    added 
                      ? 'bg-emerald-600 shadow-emerald-600/10' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 hover:translate-y-[-1px]'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {added ? 'Added to Cart!' : 'Add to Shopping Cart'}
                </button>
              </>
            )}
          </div>

          {/* Highlights warranties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-semibold">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-900/50 bg-slate-950/20">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Free delivery</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-900/50 bg-slate-950/20">
              <RotateCcw className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>30-Day returns</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-900/50 bg-slate-950/20">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>2-Year warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
