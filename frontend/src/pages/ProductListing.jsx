import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('featured');

  // Sync category changes from routing params
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setCategory(cat);
  }, [searchParams]);

  // Fetch product categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products matching search and price parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getProducts({
          category: category !== 'All' ? category : undefined,
          search: search || undefined,
          maxPrice: maxPrice || undefined
        });
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Error retrieving catalog products.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce product fetches during input searches
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, search, maxPrice]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSearchParams(cat !== 'All' ? { category: cat } : {});
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setMaxPrice(500);
    setSortBy('featured');
    setSearchParams({});
  };

  // Client sorting operation
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="rounded-2xl glass p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              Filters
            </h2>
            <button 
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Search input field */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find products..."
                className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Categories select options */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Categories
            </label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-left text-sm px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price slider range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-sm font-extrabold text-white">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer bg-slate-900"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Catalog Grid */}
      <main className="flex-grow">
        {/* Stats and sorting selection header */}
        <div className="rounded-2xl glass p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-400">
            Showing <span className="text-white">{sortedProducts.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-sm rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer font-medium"
            >
              <option value="featured">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Listing Grid */}
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="rounded-2xl border border-red-500/10 bg-red-950/10 p-12 text-center">
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-2xl glass p-16 text-center">
            <p className="text-slate-400 font-medium mb-2">No products match your filters.</p>
            <p className="text-xs text-slate-500">Try adjusting your pricing range or search parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
