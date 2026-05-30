import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return list.includes(product.id);
  });

  const toggleWishlist = (e) => {
    e.preventDefault();
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated;
    if (list.includes(product.id)) {
      updated = list.filter(id => id !== product.id);
      setIsWishlisted(false);
    } else {
      updated = [...list, product.id];
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop routing on button click
    addToCart(product, 1);
  };

  return (
    <div className="group relative rounded-2xl glass glass-hover overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative aspect-square bg-slate-900">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Wishlist Heart Toggle */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full glass hover:bg-slate-900 transition-all cursor-pointer text-slate-300 hover:text-rose-500"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
        </button>
        {/* Out of Stock banner */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
            <span className="text-rose-400 font-bold text-xs uppercase tracking-wider px-3 py-1.5 border border-rose-500/30 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="bg-slate-900 border border-slate-800 rounded-full px-2.5 py-0.5 font-medium text-[10px] text-slate-300">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-300">{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-900">
          <span className="text-lg font-extrabold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.stock > 0 ? (
            <button 
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-300"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          ) : (
            <button 
              disabled
              className="bg-slate-900 border border-slate-800/50 text-slate-600 text-xs font-semibold px-3.5 py-2 rounded-xl cursor-not-allowed"
            >
              Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
