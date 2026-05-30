import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    imagesString: '',
    stock: '',
    featured: false
  });

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Fitness'];

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch catalog products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      image: '',
      imagesString: '',
      stock: '',
      featured: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      imagesString: product.images ? product.images.join(', ') : product.image,
      stock: product.stock.toString(),
      featured: product.featured || false
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setSuccess('Product deleted successfully!');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete product.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedImages = formData.imagesString
      ? formData.imagesString.split(',').map(s => s.trim()).filter(Boolean)
      : [formData.image];

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      images: parsedImages,
      stock: parseInt(formData.stock) || 0,
      featured: formData.featured
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setSuccess('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        setSuccess('Product created successfully!');
      }
      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save product.');
    }
  };

  if (loading) return <Loader fullPage={true} />;

  // Require login to enter page
  if (!user) {
    return <Navigate to="/login?redirect=admin" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            Admin Product Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain catalog listings, restock products, or delete discontinued items.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Success notification */}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-4 text-sm font-semibold text-emerald-400 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/10 bg-red-950/10 p-4 text-sm font-semibold text-red-400 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Database Listing Table */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 sm:p-5">Product Details</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">Price</th>
                <th className="p-4 sm:p-5">Inventory Status</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="p-4 sm:p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-white block leading-tight">{product.name}</span>
                      <span className="text-xs text-slate-500 block mt-1 font-mono font-bold">{product.id}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-white font-extrabold">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-4 sm:p-5">
                    {product.stock > 10 ? (
                      <span className="text-emerald-400 font-bold">In Stock ({product.stock})</span>
                    ) : product.stock > 0 ? (
                      <span className="text-amber-400 font-bold">Low ({product.stock})</span>
                    ) : (
                      <span className="text-rose-400 font-bold">Out of Stock</span>
                    )}
                    {product.featured && (
                      <span className="text-[10px] text-indigo-400 font-bold block mt-1">★ Featured Product</span>
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-slate-900 hover:bg-rose-600 border border-slate-800 hover:border-rose-500 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl glass w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="p-6 border-b border-slate-900 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10 backdrop-blur-xs">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Catalog Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. NovaSound Headphones"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Category Selection
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none cursor-pointer font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 199.99"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Initial Stock Level
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 px-1">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-5 h-5 accent-indigo-500 rounded border-slate-800 bg-slate-900 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                    Feature on Homepage
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Experience theater quality acoustics..."
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Main Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    required
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo..."
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Alternative Gallery Image URLs (separated by comma)
                  </label>
                  <input
                    type="text"
                    name="imagesString"
                    value={formData.imagesString}
                    onChange={handleChange}
                    placeholder="https://image1.com, https://image2.com..."
                    className="w-full text-sm bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
