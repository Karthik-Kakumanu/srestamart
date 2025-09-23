import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
  Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
  Menu, X, ChevronRight, User, Truck, Search, ShoppingCart
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];
const categoryIcons = {
  livebirds: <Egg size={18} className="text-yellow-400" />,
  pickles: <CookingPot size={18} className="text-orange-500" />,
  dairy: <Milk size={18} className="text-blue-300" />,
  dryfruits: <Leaf size={18} className="text-green-500" />,
  oils: <Leaf size={18} className="text-amber-600" />,
  millets: <Wheat size={18} className="text-yellow-600" />,
  meat: <Beef size={18} className="text-red-600" />,
};
const categoryBanners = {
  livebirds: { title: "Ultimate Power Pack for Women", text: "Our Natu Kodi Eggs are packed with Omega-3 fatty acids & nutrients for hormonal balance, memory, and energy.", imageUrl: "https://via.placeholder.com/1260x750?text=Livebirds+Banner" }, // Replace with uploaded image URL if available
  pickles: { title: "Timeless Tradition in Every Jar", text: "Handcrafted with fresh ingredients, our pickles offer tangy, spicy flavors.", imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  dairy: { title: "Ultra-Pure Fresh Dairy", text: "From yogurt to ghee, sourced from pristine farms for unmatched freshness.", imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  dryfruits: { title: "Premium Superfood Treasures", text: "Vitamin-rich dry fruits for healthy snacking.", imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  oils: { title: "Exquisite Cold-Pressed Oils", text: "Nutrient-rich, unrefined oils for healthy cooking.", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXazaU1EBSkr4Hctcq7lWC3nXZDdtaVLz2w&s" },
  millets: { title: "Ancient Grains for Vitality", text: "Fiber-rich millets for a balanced lifestyle.", imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  meat: { title: "Premium Fresh Meats", text: "Ethically sourced, high-protein meats for gourmet dishes.", imageUrl: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
};
const categoryFeatures = {
  livebirds: { title: "Unlock Natu Kodi Eggs", subtitle: `"Health is wealth for women."`, description: "Nutritional eggs for wellness at every stage.", imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600", features: [{ icon: <Heart className="text-red-500"/>, title: "Hormonal Harmony", text: "Omega fatty acids for balance." }, { icon: <Bone className="text-red-500"/>, title: "Calcium Boost", text: "Strong bones." }, { icon: <BrainCircuit className="text-red-500"/>, title: "Memory Enhancement", text: "Vitamin B12 for cognition." }] },
  pickles: { title: "Homemade Flavor Symphony", subtitle: `"Tradition in every bite."`, description: "Fermented pickles for authentic flavors.", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8m41uJaxOcN9ZVxI78lDW_OFxL6g6E-mTig&s", features: [{ icon: <Microscope className="text-red-500"/>, title: "Probiotic Power", text: "Enhances digestion." }, { icon: <Leaf className="text-red-500"/>, title: "Natural Essence", text: "No additives." }, { icon: <Shield className="text-red-500"/>, title: "Immunity Boost", text: "Rich in antioxidants." }] },
  dairy: { title: "Farm-Fresh Indulgence", subtitle: `"Pure delight from farms."`, description: "High-quality dairy for vitality.", imageUrl: "https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Bone className="text-red-500"/>, title: "Protein & Calcium", text: "For bones and muscles." }, { icon: <Sun className="text-red-500"/>, title: "Vitamin D", text: "Boosts immunity." }, { icon: <Droplets className="text-red-500"/>, title: "Purity", text: "No preservatives." }] },
  dryfruits: { title: "Nutrient-Packed Snacks", subtitle: `"Energy in every handful."`, description: "Healthy fats for snacking.", imageUrl: "https://images.pexels.com/photos/2983141/pexels-photo-2983141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500"/>, title: "Heart Health", text: "Antioxidants included." }, { icon: <BatteryCharging className="text-red-500"/>, title: "Energy Surge", text: "Natural boost." }, { icon: <Sparkles className="text-red-500"/>, title: "Vitamins", text: "Rich in minerals." }] },
  oils: { title: "Cold-Pressed Liquid Gold", subtitle: `"Purity in every drop."`, description: "Nutrient-preserving oils.", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlD8qSZ1Qpf6F_pTnhy_snOlaPyGqLEB3YbQ&s", features: [{ icon: <TestTube className="text-red-500"/>, title: "Nutrient Retention", text: "Vitamins intact." }, { icon: <Heart className="text-red-500"/>, title: "Healthy Fats", text: "For heart health." }, { icon: <FilterX className="text-red-500"/>, title: "Chemical-Free", text: "Pure extraction." }] },
  millets: { title: "Timeless Supergrain", subtitle: `"Power for modern living."`, description: "Gluten-free, fiber-rich grains.", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:GcTsUCfJOmuHsF_FNrRaSTIE96Q9ToAH9sGF7Q&s", features: [{ icon: <Wheat className="text-red-500"/>, title: "Fiber-Rich", text: "Aids digestion." }, { icon: <Vegan className="text-red-500"/>, title: "Gluten-Free", text: "Safe for sensitivities." }, { icon: <Activity className="text-red-500"/>, title: "Blood Sugar", text: "Low GI." }] },
  meat: { title: "Ethical Premium Meats", subtitle: `"Fresh and flavorful."`, description: "Sustainable, high-protein meats.", imageUrl: "https://images.pexels.com/photos/618681/pexels-photo-618681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Beef className="text-red-500"/>, title: "Protein Power", text: "For muscle growth." }, { icon: <Shield className="text-red-500"/>, title: "Ethical Sourcing", text: "Animal welfare focus." }, { icon: <Sparkles className="text-red-500"/>, title: "Flavor Variety", text: "Diverse cuts." }] },
};
const categoryVideos = {
  livebirds: "/videos/eggs.mp4",
  dryfruits: "/videos/dryfruits.mp4",
  dairy: "/videos/dairy.mp4",
  oils: "/videos/oils.mp4",
  millets: "/videos/millets.mp4",
  pickles: "/videos/pickles.mp4",
  meat: "/videos/meat.mp4",
};

const CategoryBanner = ({ title, text, imageUrl }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 50, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className="w-full sm:w-3/4 mx-auto rounded-3xl overflow-hidden shadow-2xl relative transform hover:scale-102 transition-transform duration-300"
  >
    <img src={imageUrl} alt={title} className="w-full h-64 sm:h-80 object-cover" />
    <div className="absolute inset-0 bg-white/30 p-6 sm:p-8 flex items-center">
      <div>
        <h3 className="text-black text-2xl sm:text-3xl font-bold">{title}</h3>
        <p className="mt-2 text-sm sm:text-base text-gray-800" dangerouslySetInnerHTML={{ __html: text }} />
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 0 15px rgba(255,0,0,0.5)' }}
          whileTap={{ scale: 0.92 }}
          className="mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
        >
          Shop Now <ChevronRight size={16} className="inline ml-1" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => (
  <motion.section
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 rounded-xl shadow-lg mt-12"
  >
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-red-400 font-medium italic">{subtitle}</p>
        <p className="mt-4 text-gray-300 text-base sm:text-lg">{description}</p>
        <div className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                {React.cloneElement(feature.icon, { size: 20 })}
              </div>
              <div>
                <h4 className="font-semibold text-white text-base sm:text-lg">{feature.title}</h4>
                <p className="text-gray-400 text-sm sm:text-base">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-48 sm:h-64 lg:h-72 rounded-lg overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-lg" />
      </div>
    </div>
  </motion.section>
);

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
  const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
  const currentPrice = currentVariant ? currentVariant.price : 'N/A';

  return (
    <motion.div
      className="bg-gray-800/50 rounded-xl overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="w-full h-40 sm:h-48 overflow-hidden relative">
        <img
          src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">New</div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-base sm:text-lg mb-2">{product.name}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>
        {hasVariants && (
          <div className="mb-3 flex flex-wrap gap-2">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => handleVariantChange(product.id, variant.id)}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                  currentVariant?.id === variant.id
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center">
          {hasVariants ? (
            <>
              <span className="text-lg font-bold text-red-400">₹{currentPrice}</span>
              <button
                onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)}
                className="flex items-center gap-1 text-white px-3 py-1.5 text-sm font-semibold bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-all"
                disabled={!currentVariant}
              >
                <ShoppingCart size={14} /> Add
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-500">Coming Soon</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse shadow-md">
    <div className="w-full h-40 sm:h-48 bg-gray-700"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-700 rounded w-1/4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export default function HomePage({ handleAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories] = useState(CATEGORY_ORDER);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const BANNER_POSITION = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=12&category=${selectedCategory}`);
        if (res.data && Array.isArray(res.data.products)) {
          const fetchedProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
          setProducts(fetchedProducts);
          setTotalPages(res.data.totalPages);
          const initialVariants = {};
          fetchedProducts.forEach(p => {
            if (p.variants && p.variants.length > 0) initialVariants[p.id] = p.variants[0].id;
          });
          setSelectedVariants(prev => ({ ...prev, ...initialVariants }));
        } else setError('Failed to load products. Unexpected data format.');
      } catch (err) {
        setError('Failed to load products. ' + (err.message || ''));
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, currentPage]);

  const handleVariantChange = (productId, variantId) => setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
  const handleFilterChange = (category) => { setSelectedCategory(category); setCurrentPage(1); setIsSidebarOpen(false); };
  const goToNextPage = () => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const goToPreviousPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const productsBeforeBanner = currentPage === 1 ? filteredProducts.slice(0, BANNER_POSITION) : filteredProducts;
  const productsAfterBanner = currentPage === 1 ? filteredProducts.slice(BANNER_POSITION) : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { font-family: 'Poppins', sans-serif; }
      `}</style>
      <AnimatePresence>
        {categoryVideos[selectedCategory] && (
          <motion.video
            key={selectedCategory}
            src={categoryVideos[selectedCategory]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            autoPlay loop muted playsInline
            className="fixed inset-0 w-full h-full object-cover -z-10"
          />
        )}
      </AnimatePresence>
      <div className="fixed inset-0 bg-gradient-to-b from-black/20 to-black/40 -z-10"></div>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-gray-900/90 shadow-lg z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 w-auto" />
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-200 hover:text-white"><X size={20} /></button>
              </div>
              <nav className="flex-grow">
                <h3 className="text-sm font-bold text-gray-300 uppercase mb-4">Categories</h3>
                <ul className="space-y-3">
                  {categories.map(category => (
                    <li key={category}>
                      <button
                        onClick={() => handleFilterChange(category)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-gray-800'
                        }`}
                      >
                        {categoryIcons[category]}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="relative z-10">
        <header className="py-6 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <button onClick={() => setIsSidebarOpen(true)} className="sm:hidden p-2 text-white"><Menu size={24} /></button>
            <div className="flex items-center gap-4">
              <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 sm:h-16 w-auto" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Discover Our Premium Collection</h1>
            </div>
            <div className="hidden sm:flex space-x-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 max-w-2xl mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <div className="bg-red-600/20 text-red-300 p-3 rounded-lg mb-6 text-center">{error}</div>}
          <motion.div
            key={selectedCategory + searchQuery}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {productsLoading
              ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
              : productsBeforeBanner.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selectedVariants={selectedVariants}
                    handleVariantChange={handleVariantChange}
                    handleAddToCart={handleAddToCart}
                  />
                ))}
            {currentPage === 1 && categoryBanners[selectedCategory] && !productsLoading && (
              <CategoryBanner
                title={categoryBanners[selectedCategory].title}
                text={categoryBanners[selectedCategory].text}
                imageUrl={categoryBanners[selectedCategory].imageUrl}
              />
            )}
            {productsLoading
              ? null
              : productsAfterBanner.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selectedVariants={selectedVariants}
                    handleVariantChange={handleVariantChange}
                    handleAddToCart={handleAddToCart}
                  />
                ))}
          </motion.div>
          {!productsLoading && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white bg-gray-800/50 rounded-lg">Page {currentPage} / {totalPages}</span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
          {categoryFeatures[selectedCategory] && <CategoryFeatureSection {...categoryFeatures[selectedCategory]} />}
        </main>
      </div>
    </div>
  );
}