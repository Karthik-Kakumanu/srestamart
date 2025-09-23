import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, Search, Star, ShoppingCart, CheckCircle
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Helper: Add this to your index.css or a global stylesheet ---
/*
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
body {
    font-family: 'Poppins', sans-serif;
}
*/

// --- Constants, Icons, and Banners (Largely Unchanged) ---
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
        imageUrl: "https://images.pexels.com/photos/33783/olive-oil-olives-bottle-spain.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600",
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
        imageUrl: "https://images.pexels.com/photos/103541/pexels-photo-103541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
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
        imageUrl: "https://images.pexels.com/photos/2983141/pexels-photo-2983141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Heart Healthy", text: "Loaded with healthy fats, fiber, and antioxidants that support cardiovascular health." },
            { icon: <BatteryCharging className="text-red-500"/>, title: "Energy Booster", text: "A natural source of quick energy, making them a perfect pre-workout or afternoon snack." },
            { icon: <Sparkles className="text-red-500"/>, title: "Rich in Vitamins & Minerals", text: "An excellent source of essential nutrients like potassium, magnesium, and iron." }
        ]
    },
    oils: {
        title: "Cold-Pressed Liquid Gold",
        subtitle: `"Purity in every single drop."`,
        description: "Extracted using traditional cold-press methods, our oils retain their natural nutrients, flavor, and aroma, making your meals healthier and tastier.",
        imageUrl: "https://images.pexels.com/photos/3763/food-fresh-olives-oil.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
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
        imageUrl: "https://images.pexels.com/photos/12844322/pexels-photo-12844322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Wheat className="text-red-500"/>, title: "High in Dietary Fiber", text: "Promotes healthy digestion, helps in weight management, and keeps you feeling full longer." },
            { icon: <Vegan className="text-red-500"/>, title: "Naturally Gluten-Free", text: "An excellent choice for individuals with celiac disease or gluten sensitivity." },
            { icon: <Activity className="text-red-500"/>, title: "Manages Blood Sugar", text: "With a low glycemic index, millets help in preventing spikes in blood sugar levels." }
        ]
    }
};

// --- NEW & ENHANCED COMPONENTS ---

const HeroSection = () => (
    <div className="text-center py-20 md:py-32 px-4">
        <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-4xl md:text-6xl font-extrabold text-white text-shadow-lg"
        >
            Pure, Authentic & Farm-Fresh
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 text-shadow"
        >
            Discover the taste of tradition with our collection of natural and homemade products, delivered straight to your doorstep.
        </motion.p>
        <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'backOut' }}
            whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(239, 68, 68, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-red-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-red-700 transition-all shadow-lg"
        >
            Shop All Products
        </motion.button>
    </div>
);

const SearchBar = ({ onSearchChange }) => (
    <div className="relative w-full max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
            type="text"
            placeholder="Search for products..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-400 rounded-full py-3 pl-12 pr-4 border border-white/20 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
        />
    </div>
);

const CategoryBanner = ({ title, text, imageUrl }) => (
    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-6 rounded-2xl shadow-xl overflow-hidden relative">
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10" />
        <div className="bg-gradient-to-r from-black/80 to-black/30 w-full h-full p-8">
            <div className="max-w-xl">
                <h3 className="text-white text-3xl md:text-4xl font-bold">{title}</h3>
                <p className="mt-2 text-base text-gray-200" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="mt-6 bg-red-600 text-white font-bold py-2.5 px-6 rounded-full hover:bg-red-700 transition-all shadow-lg"
                >
                    Explore {title.split(' ')[0]}
                </motion.button>
            </div>
        </div>
    </div>
);

const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => (
    <section className="py-16 px-4 sm:px-8 mt-16 rounded-3xl bg-white shadow-2xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, amount: 0.5 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
                <p className="mt-2 text-red-600 font-semibold italic">{subtitle}</p>
                <p className="mt-4 text-gray-600">{description}</p>
                <div className="mt-8 space-y-6">
                    {Array.isArray(features) && features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                {React.cloneElement(feature.icon, { size: 24 })}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-lg text-gray-900">{feature.title}</h4>
                                <p className="mt-1 text-gray-600">{feature.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true, amount: 0.5 }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                className="relative h-80 lg:h-[500px] rounded-2xl shadow-lg"
            >
                <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-2xl" />
            </motion.div>
        </div>
    </section>
);

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';
    const [isAdded, setIsAdded] = useState(false);

    const onAddToCart = (e) => {
        handleAddToCart({ ...product, selectedVariant: currentVariant }, e);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Revert after 2 seconds
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col group border border-gray-200/80">
            <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden">
                <img 
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-grow">{product.description}</p>
                
                <div className="mt-4 mb-3 min-h-[34px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => (
                                <button 
                                    key={variant.id} 
                                    onClick={() => handleVariantChange(product.id, variant.id)} 
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${
                                        currentVariant?.id === variant.id
                                        ? 'bg-red-600 border-red-700 text-white shadow-sm' 
                                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {variant.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-2">
                    {hasVariants ? (
                        <>
                            <span className="text-2xl font-bold text-red-600">₹{currentPrice}</span>
                            <motion.button 
                                onClick={onAddToCart} 
                                className={`text-white px-4 py-2 text-sm font-semibold rounded-full transition-colors shadow-md hover:shadow-lg flex items-center gap-2 ${
                                    isAdded ? 'bg-green-500' : 'bg-red-600 hover:bg-red-700'
                                }`}
                                disabled={!currentVariant || isAdded}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isAdded ? <CheckCircle size={18}/> : <ShoppingCart size={18} />}
                                {isAdded ? 'Added!' : 'Add'}
                            </motion.button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center">Currently Unavailable</span>
                    )}
                </div>
            </div>
        </div>
    );
};


const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-9 bg-gray-200 rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);

// --- MAIN HOME PAGE COMPONENT ---
export default function HomePage({ handleAddToCart }) {
    const [products, setProducts] = useState([]); 
    const [allProducts, setAllProducts] = useState([]);
    const [categories] = useState(CATEGORY_ORDER);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const BANNER_POSITION = 4;
    const ITEMS_PER_PAGE = 12;

    const featuredProducts = useMemo(() => {
        // Simple logic to pick some products as featured, can be improved
        return allProducts.slice(0, 8);
    }, [allProducts]);
    
    useEffect(() => {
        const fetchAllProducts = async () => {
             try {
                // This endpoint should ideally return all (or many) products without pagination for frontend filtering/features
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?limit=100`);
                if (res.data && Array.isArray(res.data.products)) {
                    const mappedProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
                    setAllProducts(mappedProducts);
                }
            } catch (err) {
                console.error("Could not fetch all products for features:", err);
            }
        };
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;
        const fetchProducts = async () => {
            setProductsLoading(true);
            setError('');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=${ITEMS_PER_PAGE}&category=${selectedCategory}`);
                if (res.data && Array.isArray(res.data.products)) {
                    const fetchedProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
                    setProducts(fetchedProducts);
                    setTotalPages(res.data.totalPages);
                    const initialVariants = {};
                    fetchedProducts.forEach(p => {
                        if (p.variants && p.variants.length > 0) {
                            initialVariants[p.id] = p.variants[0].id;
                        }
                    });
                    setSelectedVariants(prev => ({ ...prev, ...initialVariants }));
                } else {
                    setError('Failed to load products. Unexpected data format received.');
                }
            } catch (err) {
                setError('Failed to load products. ' + (err.response?.data?.message || err.message));
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, [selectedCategory, currentPage]);

    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
    };

    const handleFilterChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        setSearchTerm(''); // Reset search on category change
        setIsSidebarOpen(false);
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const sidebarVariants = {
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    const currentBannerData = categoryBanners[selectedCategory];
    const currentFeatureData = categoryFeatures[selectedCategory];

    const productsBeforeBanner = currentPage === 1 ? filteredProducts.slice(0, BANNER_POSITION) : filteredProducts;
    const productsAfterBanner = currentPage === 1 ? filteredProducts.slice(BANNER_POSITION) : [];

    return (
        <div className="relative min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
            <style>{`
                .text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5); }
                .text-shadow-lg { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- Sidebar Menu --- */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40"
                        />
                        <motion.div
                            variants={sidebarVariants} initial="closed" animate="open" exit="closed"
                            className="fixed top-0 left-0 h-full w-72 bg-gray-800/90 backdrop-blur-lg shadow-2xl z-50 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 w-auto"/>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1"><X className="text-gray-300" /></button>
                            </div>
                            <nav className="flex-grow">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
                                <ul className="space-y-2">
                                    {categories.map(category => (
                                        <li key={category}>
                                            <button 
                                                onClick={() => handleFilterChange(category)}
                                                className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-md font-medium transition-colors ${
                                                    selectedCategory === category 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'text-gray-200 hover:bg-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">{categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}</div>
                                                <ChevronRight size={18} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <hr className="my-6 border-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Portals</h3>
                                <ul className="space-y-2">
                                    <li><a href="/vendor" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium text-gray-200 hover:bg-gray-700"><User size={18} /> Vendor</a></li>
                                    <li><a href="/delivery/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium text-gray-200 hover:bg-gray-700"><Truck size={18} /> Delivery</a></li>
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- Main Content --- */}
            <div className="relative z-10">
                {/* --- Header Section --- */}
                <header className="pt-8 sm:pt-12 pb-6 bg-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="flex items-center justify-between mb-8 relative">
                             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-full backdrop-blur-sm lg:hidden">
                                 <Menu className="text-white"/>
                             </button>
                             <div className="hidden lg:block">
                                 <img src={logoIcon} alt="Sresta Mart Logo" className="h-16 w-auto"/>
                             </div>
                             <div className="flex-grow mx-8 hidden sm:block">
                                 <SearchBar onSearchChange={setSearchTerm} />
                             </div>
                             <div className="flex items-center gap-4">
                                 {/* Other header items like cart icon can go here */}
                             </div>
                         </div>
                         <div className="sm:hidden mb-6">
                            <SearchBar onSearchChange={setSearchTerm} />
                         </div>
                         <div className="hidden lg:flex justify-center flex-wrap gap-3">
                            {categories.map(category => (
                                <motion.button 
                                    key={category} 
                                    onClick={() => handleFilterChange(category)}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-200 border-2 ${
                                        selectedCategory === category
                                            ? 'bg-red-600 text-white border-red-700 shadow-md'
                                            : 'bg-white/10 text-gray-200 border-transparent hover:bg-white/20 backdrop-blur-sm'
                                    }`}
                                >
                                    {categoryIcons[category]}
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {currentPage === 1 && !searchTerm && <HeroSection />}

                    {/* --- Featured Products Section --- */}
                    {featuredProducts.length > 0 && currentPage === 1 && !searchTerm && (
                        <section className="my-16">
                            <h2 className="text-3xl font-bold text-white text-shadow mb-6">Our Best Sellers</h2>
                            <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar">
                                {featuredProducts.map(product => (
                                    <div key={product.id} className="flex-shrink-0 w-72">
                                        <ProductCard
                                            product={product}
                                            selectedVariants={selectedVariants}
                                            handleVariantChange={handleVariantChange}
                                            handleAddToCart={handleAddToCart}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    <h2 className="text-3xl font-bold text-white text-shadow mb-8 capitalize">
                        {searchTerm ? `Searching for "${searchTerm}"` : `${selectedCategory} Collection`}
                    </h2>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center">{error}</div>
                    )}
                    
                    {/* --- Product Grid --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productsLoading
                            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <SkeletonCard key={index} />)
                            : (
                                <>
                                    {productsBeforeBanner.map(product => (
                                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                                    ))}
                                    {currentPage === 1 && currentBannerData && !productsLoading && !searchTerm && (
                                        <CategoryBanner {...currentBannerData} />
                                    )}
                                    {productsAfterBanner.map(product => (
                                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                                    ))}
                                </>
                            )
                        }
                    </div>
                    {!productsLoading && filteredProducts.length === 0 && (
                        <div className='text-center py-20 bg-white/5 rounded-2xl'>
                            <p className='text-xl text-white'>No products found.</p>
                            <p className='text-gray-400 mt-2'>Try adjusting your search or category.</p>
                        </div>
                    )}

                    {/* --- Pagination --- */}
                    {!productsLoading && totalPages > 1 && (
                        <div className="mt-16 flex justify-center items-center gap-4">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white/10 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 backdrop-blur-sm transition-colors">Previous</button>
                            <span className="px-4 py-2 text-white text-shadow">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white/10 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 backdrop-blur-sm transition-colors">Next</button>
                        </div>
                    )}

                    {/* --- Category Features Section --- */}
                    {currentFeatureData && !searchTerm && (
                        <CategoryFeatureSection {...currentFeatureData} />
                    )}
                </main>
            </div>
        </div>
    );
}