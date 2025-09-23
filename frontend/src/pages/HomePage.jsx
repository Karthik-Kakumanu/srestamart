import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Constants, Icons, and Banners ---
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
    // --- FIX WAS APPLIED HERE ---
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
    <motion.div 
        layout 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: -50 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }} 
        className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-6 rounded-2xl shadow-xl overflow-hidden relative transform"
    >
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10" />
        <div className="bg-gradient-to-r from-black/70 to-black/40 w-full h-full p-6 sm:p-8">
            <div className="max-w-2xl">
                <h3 className="text-white text-2xl md:text-3xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{title}</h3>
                <p className="mt-2 text-base text-gray-200" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="mt-4 bg-red-600 text-white font-bold py-2 px-5 rounded-full hover:bg-red-700 transition-all shadow-lg"
                >
                    Shop Now
                </motion.button>
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
        className="py-16 px-4 mt-16 rounded-3xl bg-black/70 backdrop-blur-lg shadow-2xl ring-1 ring-white/10"
    >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h2 className="text-4xl font-bold text-white">{title}</h2>
                <p className="mt-2 text-red-400 font-semibold italic">{subtitle}</p>
                <p className="mt-4 text-gray-300">{description}</p>
                <div className="mt-8 space-y-6">
                    {/* This is where the error was happening. It checks if features is an array before mapping. */}
                    {Array.isArray(features) && features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                {React.cloneElement(feature.icon, { size: 24 })}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-lg text-white">{feature.title}</h4>
                                <p className="mt-1 text-gray-300">{feature.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                className="relative h-80 lg:h-full rounded-2xl shadow-2xl"
            >
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
        <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} 
            className="bg-black/70 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col group"
        >
            <div className="w-full aspect-[4/3] overflow-hidden">
                <img 
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-white">{product.name}</h3>
                <p className="text-sm text-gray-300 mt-1 flex-grow">{product.description}</p>
                <div className="mt-3 mb-2 min-h-[34px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => {
                                const isSelected = currentVariant?.id === variant.id;
                                return (
                                    <button 
                                        key={variant.id} 
                                        onClick={() => handleVariantChange(product.id, variant.id)} 
                                        className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-red-600 border-red-700 text-white shadow-md' 
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                        }`}
                                    >
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
                            <span className="text-xl font-bold text-red-400">₹{currentPrice}</span>
                            <button 
                                onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} 
                                className="text-white px-3 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg" 
                                disabled={!currentVariant}
                            >
                                Add to Cart
                            </button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center">Currently Unavailable</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-black/70 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="w-full aspect-[4/3] bg-gray-600"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-full mb-4"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-600 rounded w-1/4"></div>
                <div className="h-8 bg-gray-600 rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);

export default function HomePage({ handleAddToCart }) {
    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState([]); 
    const [categories, setCategories] = useState(CATEGORY_ORDER);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        if (!selectedCategory) return;
        const fetchProducts = async () => {
            setProductsLoading(true);
            setError(''); // Clear previous errors
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=12&category=${selectedCategory}`);
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
                setError('Failed to load products. ' + (err.message || ''));
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
        setIsSidebarOpen(false);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };

    const productGridVariants = {
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {}
    };

    const currentBannerData = categoryBanners[selectedCategory];
    const currentFeatureData = categoryFeatures[selectedCategory];

    const productsBeforeBanner = currentPage === 1 ? products.slice(0, BANNER_POSITION) : products;
    const productsAfterBanner = currentPage === 1 ? products.slice(BANNER_POSITION) : [];

    const sidebarVariants = {
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <div className="relative min-h-screen">
            <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }`}</style>

            {/* Full-Screen Video Background */}
            <AnimatePresence>
                {categoryVideos[selectedCategory] && (
                    <motion.video 
                        key={selectedCategory} 
                        src={categoryVideos[selectedCategory]} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="fixed inset-0 w-full h-full object-cover -z-20"
                    />
                )}
            </AnimatePresence>
            <div className="fixed inset-0 bg-black/50 -z-10"></div>

            {/* Sidebar Menu */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40"
                        />
                        <motion.div
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-72 bg-black/70 backdrop-blur-lg shadow-2xl z-50 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 w-auto"/>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1">
                                    <X className="text-gray-300" />
                                </button>
                            </div>
                            <nav className="flex-grow">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Product Filters</h3>
                                <ul className="space-y-2">
                                    {categories.map(category => (
                                        <li key={category}>
                                            <button 
                                                onClick={() => handleFilterChange(category)}
                                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-md font-medium transition-colors ${
                                                    selectedCategory === category 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {categoryIcons[category]}
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </div>
                                                <ChevronRight size={18} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <hr className="my-6 border-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Portals</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="/vendor" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium text-gray-300 hover:bg-gray-800">
                                            <User size={18} /> Vendor
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/delivery/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium text-gray-300 hover:bg-gray-800">
                                            <Truck size={18} /> Delivery
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <div className="pt-8 sm:pt-12 pb-6 bg-black/70 backdrop-blur-lg">
                    <div className="flex flex-row items-center justify-center mb-8 relative px-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm"
                        >
                            <Menu className="text-white"/>
                        </button>
                        <div className="flex items-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.6, ease: "easeOut" }} 
                                className="mr-4 hidden sm:block"
                            >
                                <img src={logoIcon} alt="Sresta Mart Logo" className="h-20 md:h-24 w-auto"/>
                            </motion.div>
                            <motion.h2 
                                initial={{opacity: 0, y: -20}} 
                                animate={{opacity: 1, y: 0}} 
                                transition={{ delay: 0.2 }} 
                                className="text-4xl sm:text-5xl font-bold text-white text-shadow text-center"
                            >
                                Explore Our Collection
                            </motion.h2>
                        </div>
                    </div>
                    <div className="mt-8 hidden sm:flex justify-center flex-wrap gap-3 px-4">
                        {categories.map(category => (
                            <motion.button 
                                key={category} 
                                onClick={() => handleFilterChange(category)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                                    selectedCategory === category
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/70 backdrop-blur-sm'
                                }`}
                            >
                                {categoryIcons[category]}
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100/90 backdrop-blur-sm text-red-700 p-4 rounded-lg mb-8 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Product Grid and Banner */}
                    <motion.div
                        key={selectedCategory} // Add key to force re-render on category change
                        variants={productGridVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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
                        {currentPage === 1 && currentBannerData && !productsLoading && (
                            <CategoryBanner
                                title={currentBannerData.title}
                                text={currentBannerData.text}
                                imageUrl={currentBannerData.imageUrl}
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

                    {/* Pagination */}
                    {!productsLoading && totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-800/70 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/70 backdrop-blur-sm transition-colors"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-white text-shadow">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-800/70 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/70 backdrop-blur-sm transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Category Features Section */}
                    {currentFeatureData && (
                        <CategoryFeatureSection
                            title={currentFeatureData.title}
                            subtitle={currentFeatureData.subtitle}
                            description={currentFeatureData.description}
                            imageUrl={currentFeatureData.imageUrl}
                            features={currentFeatureData.features}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}