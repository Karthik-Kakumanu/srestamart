import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// NEW: Importing more icons for the category filters
import { Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef } from 'lucide-react';
import logoIcon from '../../images/icon.png';

const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];

// NEW: Mapping icons to each category
const categoryIcons = {
    livebirds: <Egg size={16} />,
    pickles: <CookingPot size={16} />,
    dairy: <Milk size={16} />,
    dryfruits: <Leaf size={16} />,
    oils: <Leaf size={16} />,
    millets: <Wheat size={16} />,
    meat: <Beef size={16} />,
};

const categoryBanners = {
    livebirds: {
        title: "Nature’s Power Pack for Women",
        text: "Our <strong>Natu Kodi Eggs</strong> are a commitment to health, delivering Omega fatty acids & vital nutrients to support hormonal balance, improve memory, and boost energy.",
        imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    pickles: {
        title: "A Taste of Tradition in Every Jar",
        text: "Handcrafted with authentic recipes and the freshest ingredients, our pickles bring the timeless flavors of home to your table. Tangy, spicy, and irresistibly delicious.",
        imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dairy: {
        title: "Pure, Fresh & Delivered Daily",
        text: "From creamy yogurts to rich, pure ghee, our dairy products are sourced from local farms, ensuring unparalleled freshness and nutritional value for your family.",
        imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dryfruits: {
        title: "Nature's Finest Superfoods",
        text: "Packed with energy and wholesome goodness, our premium selection of dry fruits and nuts are the perfect healthy snack for any time of the day.",
        imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    oils: {
        title: "Cold-Pressed Purity",
        text: "Experience the authentic flavor and health benefits of our traditionally extracted, cold-pressed oils. Pure, unadulterated, and perfect for wholesome cooking.",
        imageUrl: "https://images.pexels.com/photos/33783/olive-oil-olives-bottle-food.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    millets: {
        title: "The Ancient Grain for Modern Health",
        text: "Rediscover the power of millets. Our range of ancient grains is rich in fiber and nutrients, making them a perfect, healthy choice for a balanced diet.",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
};

const categoryFeatures = {
    livebirds: {
        title: "The Power of Natu Kodi Eggs",
        subtitle: `"Healthy is always wealthy for our girl child, girls and women's"`,
        description: "Our Natu Kodi eggs are a powerhouse of nutrition, specially chosen for their incredible health benefits.",
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Balance", text: "Rich in Omega fatty acids, essential for helping girls and women maintain hormonal balance." },
            { icon: <Bone className="text-red-500"/>, title: "Rich in Calcium", text: "Packed with natural calcium to support strong bones at every stage of life." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Boosts Memory Power", text: "An excellent source of Vitamin B12, which is proven to improve memory and cognitive function in children." }
        ]
    },
    // ... other categoryFeatures objects
};

const CategoryBanner = ({ title, text, imageUrl }) => (
    <motion.div layout initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-6 rounded-2xl shadow-xl overflow-hidden relative transform">
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10" />
        <div className="bg-gradient-to-r from-black/70 to-black/40 w-full h-full p-6 sm:p-8">
            <div className="max-w-2xl">
                <h3 className="text-white text-2xl md:text-3xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{title}</h3>
                <p className="mt-2 text-base text-gray-200" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 bg-red-600 text-white font-bold py-2 px-5 rounded-full hover:bg-red-700 transition-all shadow-lg">Shop Now</motion.button>
            </div>
        </div>
    </motion.div>
);

const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => (
    <motion.section 
        key={title}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        // UPDATED: Added a semi-transparent, blurred background for a "glass" effect
        className="py-16 px-4 mt-16 rounded-3xl bg-gray-50/80 backdrop-blur-sm shadow-2xl ring-1 ring-black/5"
    >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                <h2 className="text-4xl font-bold text-gray-800">{title}</h2>
                <p className="mt-2 text-red-600 font-semibold italic">{subtitle}</p>
                <p className="mt-4 text-gray-600">{description}</p>
                <div className="mt-8 space-y-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                {React.cloneElement(feature.icon, { size: 24 })}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-lg text-gray-800">{feature.title}</h4>
                                <p className="mt-1 text-gray-500">{feature.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="relative h-80 lg:h-full rounded-2xl shadow-2xl">
                 <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-2xl" />
            </motion.div>
        </div>
    </motion.section>
);

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';

    return (
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col group">
            <div className="w-full aspect-[4/3] overflow-hidden">
                <img src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-grow">{product.description}</p>
                <div className="mt-3 mb-2 min-h-[34px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => {
                                const isSelected = currentVariant?.id === variant.id;
                                return (
                                    <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${isSelected ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300'}`}>
                                        {variant.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                    {hasVariants ? (
                        <>
                            <span className="text-xl font-bold text-red-700">₹{currentPrice}</span>
                            <button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="text-white px-3 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg" disabled={!currentVariant}>
                                Add to Cart
                            </button>
                        </>
                    ) : (<span className="text-sm font-semibold text-gray-500 w-full text-center">Currently Unavailable</span>)}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="w-full aspect-[4/3] bg-gray-200"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);


export default function HomePage({ handleAddToCart }) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const BANNER_POSITION = 4;

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
    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
            if (Array.isArray(res.data)) {
                const products = res.data.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
                setAllProducts(products);
                const uniqueFetchedCategories = [...new Set(products.map(p => p.category))];
                const sortedCategories = uniqueFetchedCategories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
                setCategories(sortedCategories);
                if (sortedCategories.length > 0) {
                    const defaultCategory = selectedCategory || sortedCategories[0];
                    setSelectedCategory(defaultCategory);
                    setFilteredProducts(products.filter(p => p.category === defaultCategory));
                } else {
                    setFilteredProducts(products);
                }
                const initialVariants = {};
                products.forEach(p => {
                    if (p.variants && p.variants.length > 0) {
                        initialVariants[p.id] = p.variants[0].id;
                    }
                });
                setSelectedVariants(initialVariants);
            } else {
                setError('Failed to load products. Unexpected data format received.');
            }
        } catch (err) {
            setError('Failed to load products. ' + (err.message || ''));
        } finally {
            setProductsLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    setProductsLoading(true);
    setTimeout(() => {
        setFilteredProducts(allProducts.filter(p => p.category === category));
        setProductsLoading(false);
    }, 300);
  };
  
  const productGridVariants = {
    visible: { transition: { staggerChildren: 0.05 } },
    hidden: {}
  };

  const currentBannerData = categoryBanners[selectedCategory];
  const currentFeatureData = categoryFeatures[selectedCategory];

  const productsBeforeBanner = filteredProducts.slice(0, BANNER_POSITION);
  const productsAfterBanner = filteredProducts.slice(BANNER_POSITION);

  return (
    // FIX & UPDATE: Removed solid background and added explicit transparency
    <div className="flex-grow bg-transparent">
      <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }`}</style>

      {/* NEW: Smoothly animated video background */}
      <AnimatePresence>
        {categoryVideos[selectedCategory] && (
          <motion.video 
            key={selectedCategory} 
            src={categoryVideos[selectedCategory]} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            autoPlay loop muted playsInline 
            className="fixed top-0 left-0 w-full h-full object-cover -z-20"
            style={{ opacity: 0.15 }} // Reduced opacity for better text readability
          />
        )}
      </AnimatePresence>
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 -z-10"></div>

      <div className="relative z-10">
        <div className="pt-8 sm:pt-12 pb-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex flex-row items-center justify-center mb-8">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mr-4">
              <img src={logoIcon} alt="Sresta Mart Logo" className="h-20 md:h-24 w-auto"/>
            </motion.div>
            <motion.h2 initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{ delay: 0.2 }} className="text-4xl sm:text-5xl font-bold text-white text-center text-shadow">
              Explore Our Collection
            </motion.h2>
          </div>
          {/* UPDATED: Category filters with icons */}
          <div className="mt-8 flex justify-center flex-wrap gap-3 px-4">
            {categories.map(category => (
                <motion.button 
                  key={category} 
                  onClick={() => handleFilterChange(category)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category 
                    ? `bg-white text-red-600 shadow-lg` 
                    : 'bg-white/20 text-white hover:bg-white/40 text-shadow backdrop-blur-sm'
                  }`}
                >
                  {categoryIcons[category]}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
            ))}
          </div>
        </div>
      </div>
      
      <main className="p-4 sm:p-8 relative z-10 max-w-7xl mx-auto">
        {error && <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"><strong className="font-bold">Error:</strong><span className="block sm:inline ml-2">{error}</span></div>}
        
        <motion.div key={selectedCategory} initial="hidden" animate="visible" variants={productGridVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsLoading ? (
                [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
                <>
                    {productsBeforeBanner.map((product) => (
                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                    ))}
                    <AnimatePresence>
                        {currentBannerData && productsAfterBanner.length > 0 && <CategoryBanner {...currentBannerData} />}
                    </AnimatePresence>
                    {productsAfterBanner.map((product) => (
                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                    ))}
                </>
            )}
        </motion.div>
        
        <AnimatePresence>
            {!productsLoading && currentFeatureData && <CategoryFeatureSection {...currentFeatureData} />}
        </AnimatePresence>
      </main>
    </div>
  );
}