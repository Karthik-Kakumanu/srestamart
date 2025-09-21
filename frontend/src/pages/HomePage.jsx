import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// NEW: Importing ALL icons needed for the feature sections
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity 
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];

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
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXazaU1EBSkr4Hctcq7lWC3nXZDdtaVLz2w&s"
    },
    millets: {
        title: "The Ancient Grain for Modern Health",
        text: "Rediscover the power of millets. Our range of ancient grains is rich in fiber and nutrients, making them a perfect, healthy choice for a balanced diet.",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
};

// --- FULLY POPULATED CATEGORY FEATURES OBJECT ---
const categoryFeatures = {
    livebirds: {
        title: "The Power of Natu Kodi Eggs",
        subtitle: `"Healthy is always wealthy for our girl child, girls and women's"`,
        description: "Our Natu Kodi eggs are a powerhouse of nutrition, specially chosen for their incredible health benefits.",
        imageUrl: https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Balance", text: "Rich in Omega fatty acids, essential for helping girls and women maintain hormonal balance." },
            { icon: <Bone className="text-red-500"/>, title: "Rich in Calcium", text: "Packed with natural calcium to support strong bones at every stage of life." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Boosts Memory Power", text: "An excellent source of Vitamin B12, which is proven to improve memory and cognitive function in children." }
        ]
    },
    pickles: {
        title: "Authentic Homemade Flavors",
        subtitle: `"A taste of tradition in every bite."`,
        description: "Our pickles are made using timeless family recipes and natural preservation techniques, ensuring every jar is packed with authentic taste and goodness.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8m41uJaxOcN9ZVxI78lDW_OFxL6g6E-mTig&s",
        features: [
            { icon: <Microscope className="text-red-500"/>, title: "Probiotic Rich", text: "Naturally fermented pickles are a great source of probiotics that promote a healthy gut." },
            { icon: <Leaf className="text-red-500"/>, title: "Natural Ingredients", text: "Made with sun-dried ingredients and pure oils, free from any artificial preservatives." },
            { icon: <Shield className="text-red-500"/>, title: "Boosts Immunity", text: "Rich in antioxidants and essential vitamins like Vitamin K that help strengthen the immune system." }
        ]
    },
    dairy: {
        title: "Farm-Fresh Goodness",
        subtitle: `"Pure, creamy, and delivered from local farms."`,
        description: "Experience the unmatched taste and quality of our dairy products, from pure A2 milk to rich, golden ghee, essential for a healthy lifestyle.",
        imageUrl: "https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Bone className="text-red-500"/>, title: "Rich in Protein & Calcium", text: "Essential for building strong bones, teeth, and promoting healthy muscle development." },
            { icon: <Sun className="text-red-500"/>, title: "Source of Vitamin D", text: "Our fortified dairy products help your body absorb calcium and support immune function." },
            { icon: <Droplets className="text-red-500"/>, title: "Pure and Unadulterated", text: "We guarantee purity with no added hormones or preservatives, just natural goodness." }
        ]
    },
    dryfruits: {
        title: "Nature's Nutrient-Dense Snack",
        subtitle: `"Your daily dose of energy and wellness."`,
        description: "Our handpicked selection of premium dry fruits and nuts are packed with vitamins, minerals, and healthy fats for a perfect, guilt-free snack.",
        imageUrl: "data:image/jpeg;base64,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",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Heart Healthy", text: "Contains healthy fats and antioxidants that help lower bad cholesterol and support cardiovascular health." },
            { icon: <BatteryCharging className="text-red-500"/>, title: "Instant Energy Booster", text: "A perfect pre-workout or midday snack to provide a quick and sustained energy lift." },
            { icon: <Sparkles className="text-red-500"/>, title: "Improves Digestion", text: "High in dietary fiber, which aids in digestion and helps maintain a healthy gut." }
        ]
    },
    oils: {
        title: "Cold-Pressed Liquid Gold",
        subtitle: `"Purity in every single drop."`,
        description: "Extracted using traditional cold-press methods, our oils retain their natural nutrients, flavor, and aroma, making your meals healthier and tastier.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlD8qSZ1Qpf6F_pTnhy_snOlaPyGqLEB3YbQ&s",
        features: [
            { icon: <TestTube className="text-red-500"/>, title: "Retains Nutrients", text: "Cold-pressing ensures that vitamins and antioxidants are preserved, unlike refined oils." },
            { icon: <Heart className="text-red-500"/>, title: "Rich in Healthy Fats", text: "Abundant in monounsaturated and polyunsaturated fats, which are beneficial for heart health." },
            { icon: <FilterX className="text-red-500"/>, title: "100% Chemical-Free", text: "Absolutely no chemicals or solvents are used in the extraction process, ensuring ultimate purity." }
        ]
    },
    millets: {
        title: "The Ancient Supergrain",
        subtitle: `"Rediscover the wholesome power of millets."`,
        description: "Gluten-free and rich in fiber, millets are a fantastic, low-glycemic alternative to rice and wheat, perfect for managing a healthy lifestyle.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUCfJOmuHsF_FNrRaSTIE96Q9ToAH9sGF7Q&s",
        features: [
            { icon: <Wheat className="text-red-500"/>, title: "High in Dietary Fiber", text: "Promotes healthy digestion, helps in weight management, and keeps you feeling full longer." },
            { icon: <Vegan className="text-red-500"/>, title: "Naturally Gluten-Free", text: "An excellent choice for individuals with celiac disease or gluten sensitivity." },
            { icon: <Activity className="text-red-500"/>, title: "Manages Blood Sugar", text: "With a low glycemic index, millets help in preventing spikes in blood sugar levels." }
        ]
    }
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
    <div className="flex-grow bg-transparent">
      <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }`}</style>

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