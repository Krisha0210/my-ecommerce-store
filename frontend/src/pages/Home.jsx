import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Cpu, Shirt, Home as HomeIcon, Flame } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const categoriesList = [
  { name: 'Electronics', icon: Cpu, desc: 'High-performance audio, trackers & watches', color: 'from-indigo-500/10 to-cyan-500/10' },
  { name: 'Fashion', icon: Shirt, desc: 'Italian watches, organic canvas bags', color: 'from-purple-500/10 to-rose-500/10' },
  { name: 'Home & Living', icon: HomeIcon, desc: 'Ergonomic office wares & smart brewers', color: 'from-emerald-500/10 to-teal-500/10' },
  { name: 'Fitness', icon: Flame, desc: 'High-grip mats, breathable running shoes', color: 'from-rose-500/10 to-amber-500/10' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const products = await api.getProducts();
        setFeaturedProducts(products.filter(p => p.featured));
      } catch (err) {
        console.error(err);
        setError('Could not retrieve products. Make sure the server is active!');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="relative overflow-hidden pb-16">
      {/* Background glow decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 fill-indigo-400 animate-pulse" />
          Exquisite Design. Absolute Performance.
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight tracking-tight max-w-5xl mx-auto">
          Elevate Your Everyday <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Digital Lifestyle.
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Discover a curated ecosystem of premium electronics, lifestyle accessories, and high-performance everyday products engineered for comfort and style.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/products"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:translate-y-[-1px]"
          >
            Explore Catalog
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center md:text-left">
          Shop by Category
        </h2>
        <p className="text-sm text-slate-400 mb-10 text-center md:text-left">
          Pick your destination collection and start exploring.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`group rounded-2xl glass p-6 flex flex-col items-start gap-4 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 bg-gradient-to-br ${cat.color} to-slate-950/20`}
              >
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Collections
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top trending selections highly recommended by our curators.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all products &rarr;
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="rounded-xl border border-red-500/10 bg-red-950/10 p-6 text-center">
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
