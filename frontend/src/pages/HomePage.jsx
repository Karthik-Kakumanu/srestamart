import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef, Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity, Menu, X, ChevronRight, User, Truck } from 'lucide-react';
import logoIcon from '../../images/icon.png';

// Keep your constants here (CATEGORY_ORDER, categoryIcons, categoryBanners, categoryFeatures)

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
  const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
  const currentPrice = currentVariant ? currentVariant.price : 'N/A';

  return (
    <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col group">
      <div className="w-full aspect-[4/3] overflow-hidden">
        <img src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 flex-grow">{product.description}</p>
        {hasVariants && (
          <div className="flex items-center gap-2 flex-wrap mt-3 mb-2">
            {product.variants.map(variant => (
              <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${selectedVariantId === variant.id ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>
                {variant.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-auto pt-2">
          {hasVariants ? (
            <>
              <span className="text-xl font-bold text-red-700">₹{currentPrice}</span>
              <button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="text-white px-3 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md" disabled={!currentVariant}>Add to Cart</button>
            </>
          ) : <span className="text-sm font-semibold text-gray-500 w-full text-center">Currently Unavailable</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage({ handleAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categoryVideos = {
    livebirds: "/videos/eggs.mp4",
    dryfruits: "/videos/dryfruits.mp4",
    dairy: "/videos/dairy.mp4",
    oils: "/videos/oils.mp4",
    millets: "/videos/millets.mp4",
    pickles: "/videos/pickles.mp4",
    meat: "/videos/meat.mp4",
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=1&limit=1000`)
      .then(res => {
        const allProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
        const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) setSelectedCategory(uniqueCategories[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setProductsLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=1&limit=12&category=${selectedCategory}`)
      .then(res => {
        const fetchedProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
        setProducts(fetchedProducts);
        const initialVariants = {};
        fetchedProducts.forEach(p => {
          if (p.variants?.length > 0) initialVariants[p.id] = p.variants[0].id;
        });
        setSelectedVariants(initialVariants);
      })
      .finally(() => setProductsLoading(false));
  }, [selectedCategory]);

  return (
    <div className="relative">
      {/* Background video */}
      {categoryVideos[selectedCategory] && (
        <video className="absolute inset-0 w-full h-full object-cover -z-10" src={categoryVideos[selectedCategory]} autoPlay loop muted />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <img src={logoIcon} alt="logo" className="h-12" />
              <button onClick={() => setIsSidebarOpen(false)}><X /></button>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Products</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <button onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg ${selectedCategory === cat ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'}`}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
            <hr className="my-4" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Products Preview</h3>
            <div className="space-y-3">
              {products.slice(0, 4).map(p => <div key={p.id} className="p-2 bg-gray-50 rounded-lg shadow text-sm">{p.name}</div>)}
            </div>
            <hr className="my-4" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Portals</h3>
            <a href="/delivery/login" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Delivery</a>
            <a href="/vendor" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Vendor</a>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 bg-red-600 text-white p-2 rounded-full shadow-xl z-50">
        <Menu />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 relative z-10">
        {productsLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white/60 rounded-2xl shadow-lg h-64 animate-pulse" />) :
          products.map(product => <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={(pid, vid) => setSelectedVariants(prev => ({ ...prev, [pid]: vid }))} handleAddToCart={handleAddToCart} />)}
      </div>
    </div>
  );
}