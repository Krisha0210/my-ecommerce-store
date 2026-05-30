import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = async () => {
    try {
      const data = await api.getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load product details.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct().finally(() => setLoading(false));
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
                    i < Math.floor(product.rating || 5.0) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-700'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-300">
              {(product.rating || 5.0).toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-slate-500 font-medium ml-2">
              ({product.reviews ? product.reviews.length : 0} Reviews)
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

      {/* Customer Reviews Section */}
      <section className="mt-16 pt-12 border-t border-slate-900">
        <h2 className="text-2xl font-extrabold text-white mb-8">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Rating Summary Card */}
          <div className="glass p-6 rounded-2xl border border-slate-900 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-white">{(product.rating || 5.0).toFixed(1)}</span>
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 5.0) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-700'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">Based on {product.reviews ? product.reviews.length : 0} reviews</span>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="flex flex-col gap-3.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const reviews = product.reviews || [];
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-3 font-semibold">{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List & Submission */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Review form for authenticated users */}
            {user ? (
              <div className="glass p-6 rounded-2xl border border-slate-900 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>
                <h3 className="text-base font-bold text-white mb-4">Write a Customer Review</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (submittingReview) return;
                  if (rating === 0) {
                    setReviewError('Please select a star rating.');
                    return;
                  }
                  if (!comment.trim()) {
                    setReviewError('Please write a comment.');
                    return;
                  }

                  setSubmittingReview(true);
                  setReviewError('');
                  setReviewSuccess('');
                  try {
                    await api.submitProductReview(id, rating, comment);
                    setComment('');
                    setRating(0);
                    setReviewSuccess('Thank you! Your review has been submitted successfully.');
                    await fetchProduct();
                    setTimeout(() => setReviewSuccess(''), 4000);
                  } catch (err) {
                    console.error(err);
                    setReviewError(err.message || 'Failed to submit review. Please try again.');
                  } finally {
                    setSubmittingReview(false);
                  }
                }} className="flex flex-col gap-4">
                  {/* Star selection rating */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 font-medium">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setRating(stars)}
                          onMouseEnter={() => setHoverRating(stars)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              stars <= (hoverRating || rating) 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-700 hover:text-slate-500'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment text */}
                  <textarea
                    rows="3"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none resize-none transition-colors"
                  />

                  {reviewError && <p className="text-xs font-semibold text-rose-400">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xs font-semibold text-emerald-400">{reviewSuccess}</p>}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="self-end bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass p-6 rounded-2xl border border-slate-900 text-center">
                <p className="text-sm text-slate-400 mb-3">You must be logged in to post a review.</p>
                <Link to={`/login?redirect=product/${id}`} className="inline-block text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow">
                  Sign In to Review
                </Link>
              </div>
            )}

            {/* List of reviews */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">All Reviews ({product.reviews ? product.reviews.length : 0})</h3>
              {(!product.reviews || product.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 font-medium italic">No reviews yet for this product. Be the first to write one!</p>
              ) : (
                product.reviews.map(rev => (
                  <div key={rev.id} className="rounded-xl border border-slate-900 bg-slate-950/20 p-5 flex gap-4">
                    {/* User initials bubble */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                        <h4 className="text-sm font-bold text-white truncate">{rev.userName || 'Anonymous'}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < rev.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-800'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
