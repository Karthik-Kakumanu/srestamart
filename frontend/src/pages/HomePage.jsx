import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, Search, ShoppingCart
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Enhanced Constants, Icons, and Banners for More Attractiveness ---
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
    livebirds: {
        title: "Nature’s Ultimate Power Pack for Women",
        text: "Our <strong>Natu Kodi Eggs</strong> embody a true commitment to wellness, packed with Omega-3 fatty acids & essential nutrients to harmonize hormones, sharpen memory, and skyrocket energy levels.",
        imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    pickles: {
        title: "Timeless Tradition in Every Exquisite Jar",
        text: "Meticulously handcrafted with heirloom recipes and the freshest seasonal ingredients, our pickles deliver an explosion of tangy, spicy, and utterly irresistible flavors straight from home kitchens.",
        imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dairy: {
        title: "Ultra-Pure, Freshly Delivered Daily",
        text: "From velvety yogurts to luxurious, golden ghee, our dairy delights are sourced from pristine local farms, guaranteeing unmatched freshness and superior nutritional benefits for your loved ones.",
        imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dryfruits: {
        title: "Nature's Premium Superfood Treasures",
        text: "Brimming with vitality and pure goodness, our elite assortment of dry fruits and nuts serves as the ultimate healthy indulgence for any moment of your day.",
        imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    oils: {
        title: "Exquisite Cold-Pressed Purity",
        text: "Savor the genuine essence and profound health advantages of our artisan cold-pressed oils. Unrefined, authentic, and ideal for elevating your wholesome culinary creations.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXazaU1EBSkr4Hctcq7lWC3nXZDdtaVLz2w&s"
    },
    millets: {
        title: "Ancient Grains for Contemporary Vitality",
        text: "Reignite your passion for millets. Our curated selection of heritage grains is loaded with fiber and vital nutrients, crafting the perfect foundation for a vibrant, balanced lifestyle.",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    meat: {
        title: "Premium Fresh Meats for Gourmet Delights",
        text: "Sourced from ethical farms, our high-quality meats offer rich flavors and essential proteins, perfect for creating mouthwatering dishes that nourish and satisfy.",
        imageUrl: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
};

const categoryFeatures = {
    livebirds: {
        title: "Unlock the Power of Natu Kodi Eggs",
        subtitle: `"Health is the true wealth for our girl child, girls, and women."`,
        description: "Our Natu Kodi eggs are nutritional dynamos, carefully selected for their extraordinary benefits that empower wellness at every life stage.",
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Harmony", text: "Abundant in Omega fatty acids, crucial for balancing hormones in girls and women." },
            { icon: <Bone className="text-red-500"/>, title: "Superior Calcium Boost", text: "Naturally loaded with calcium to fortify bones throughout life." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Memory Enhancement", text: "A prime source of Vitamin B12, enhancing cognitive sharpness and memory in kids." }
        ]
    },
    pickles: {
        title: "Exquisite Homemade Flavor Symphony",
        subtitle: `"Tradition's taste in every delightful bite."`,
        description: "Crafted with cherished family recipes and natural fermentation, each jar bursts with authentic, healthful flavors that elevate every meal.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8m41uJaxOcN9ZVxI78lDW_OFxL6g6E-mTig&s",
        features: [
            { icon: <Microscope className="text-red-500"/>, title: "Probiotic Powerhouse", text: "Fermented naturally for gut-healthy probiotics that enhance digestion." },
            { icon: <Leaf className="text-red-500"/>, title: "Pure Natural Essence", text: "Sun-dried ingredients and premium oils, sans artificial additives." },
            { icon: <Shield className="text-red-500"/>, title: "Immunity Fortifier", text: "Packed with antioxidants and Vitamin K for robust immune support." }
        ]
    },
    dairy: {
        title: "Exquisite Farm-Fresh Indulgence",
        subtitle: `"Pure, creamy delights straight from local farms."`,
        description: "Indulge in the superior quality of our dairy range, from A2 milk to opulent ghee, vital for nourishing daily vitality.",
        imageUrl: "https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Bone className="text-red-500"/>, title: "Protein & Calcium Rich", text: "Key for strong bones, teeth, and muscle growth." },
            { icon: <Sun className="text-red-500"/>, title: "Vitamin D Source", text: "Aids calcium absorption and bolsters immunity." },
            { icon: <Droplets className="text-red-500"/>, title: "Unadulterated Purity", text: "No hormones or preservatives—just natural excellence." }
        ]
    },
    dryfruits: {
        title: "Nature's Elite Nutrient-Packed Snacks",
        subtitle: `"Daily energy and wellness in every handful."`,
        description: "Our premium dry fruits and nuts are vitamin-rich treasures, offering healthy fats for guilt-free snacking anytime.",
        imageUrl: "https://images.pexels.com/photos/2983141/pexels-photo-2983141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Heart-Protective", text: "Full of healthy fats, fiber, and antioxidants for cardiovascular wellness." },
            { icon: <BatteryCharging className="text-red-500"/>, title: "Instant Energy Surge", text: "Natural boost for workouts or midday slumps." },
            { icon: <Sparkles className="text-red-500"/>, title: "Vitamin & Mineral Haven", text: "Essential nutrients like potassium, magnesium, and iron." }
        ]
    },
    oils: {
        title: "Luxurious Cold-Pressed Liquid Gold",
        subtitle: `"Purity distilled in every drop."`,
        description: "Traditionally cold-pressed to preserve nutrients, flavor, and aroma, transforming your cooking into a healthful art.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlD8qSZ1Qpf6F_pTnhy_snOlaPyGqLEB3YbQ&s",
        features: [
            { icon: <TestTube className="text-red-500"/>, title: "Nutrient Preservation", text: "Vitamins and antioxidants intact, superior to refined alternatives." },
            { icon: <Heart className="text-red-500"/>, title: "Healthy Fat Abundance", text: "Monounsaturated and polyunsaturated fats for heart health." },
            { icon: <FilterX className="text-red-500"/>, title: "Chemical-Free Assurance", text: "No solvents or chemicals—pure extraction mastery." }
        ]
    },
    millets: {
        title: "The Timeless Supergrain Revolution",
        subtitle: `"Wholesome ancient power for modern living."`,
        description: "Gluten-free, fiber-rich millets offer a low-GI alternative to staples, ideal for sustained health and energy.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUCfJOmuHsF_FNrRaSTIE96Q9ToAH9sGF7Q&s",
        features: [
            { icon: <Wheat className="text-red-500"/>, title: "Fiber-Rich Delight", text: "Aids digestion, weight control, and satiety." },
            { icon: <Vegan className="text-red-500"/>, title: "Gluten-Free Naturally", text: "Perfect for gluten sensitivities or celiac needs." },
            { icon: <Activity className="text-red-500"/>, title: "Blood Sugar Stabilizer", text: "Low GI prevents sugar spikes effectively." }
        ]
    },
    meat: {
        title: "Premium Ethical Meats",
        subtitle: `"Fresh, flavorful, and responsibly sourced."`,
        description: "Our meats are from sustainable farms, providing high-protein options with rich taste for gourmet cooking.",
        imageUrl: "https://images.pexels.com/photos/618681/pexels-photo-618681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Beef className="text-red-500"/>, title: "Protein Powerhouse", text: "Essential for muscle repair and growth." },
            { icon: <Shield className="text-red-500"/>, title: "Ethical Sourcing", text: "From farms prioritizing animal welfare." },
            { icon: <Sparkles className="text-red-500"/>, title: "Flavorful Variety", text: "Cuts perfect for diverse cuisines." }
        ]
    }
};

const CategoryBanner = ({ title, text, imageUrl }) => (
    <motion.div 
        layout 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: -50 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }} 
        className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-8 rounded-3xl shadow-2xl overflow-hidden relative transform hover:scale-102 transition-transform duration-300"
    >
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10 filter brightness-75" />
        <div className="bg-gradient-to-r from-black/80 via-black/60 to-transparent w-full h-full p-8 sm:p-12 flex items-center">
            <div className="max-w-3xl">
                <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>{title}</h3>
                <p className="mt-4 text-lg sm:text-xl text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button 
                    whileHover={{ scale: 1.08, boxShadow: '0 0 15px rgba(255,0,0,0.5)' }} 
                    whileTap={{ scale: 0.92 }} 
                    className="mt-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 px-8 rounded-full hover:from-red-700 hover:to-red-900 transition-all shadow-xl"
                >
                    Shop Now <ChevronRight size={18} className="inline ml-2" />
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
        className="py-20 px-6 mt-20 rounded-3xl bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-xl shadow-3xl ring-1 ring-red-500/20"
    >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h2 className="text-5xl font-extrabold text-white leading-tight">{title}</h2>
                <p className="mt-3 text-red-400 font-semibold italic text-xl">{subtitle}</p>
                <p className="mt-6 text-gray-200 text-lg leading-relaxed">{description}</p>
                <div className="mt-10 space-y-8">
                    {Array.isArray(features) && features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-start gap-4"
                        >
                            <div className="flex-shrink-0 w-14 h-14 bg-red-100/80 rounded-full flex items-center justify-center shadow-md">
                                {React.cloneElement(feature.icon, { size: 28 })}
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-white">{feature.title}</h4>
                                <p className="mt-2 text-gray-300">{feature.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                className="relative h-96 lg:h-full rounded-3xl shadow-2xl overflow-hidden"
            >
                <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-3xl filter brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
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
            variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }} 
            className="bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col group"
            whileHover={{ y: -5 }}
        >
            <div className="w-full aspect-[4/3] overflow-hidden relative">
                <img 
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    New
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-300 mb-4 flex-grow line-clamp-3">{product.description}</p>
                <div className="mb-4 min-h-[40px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => {
                                const isSelected = currentVariant?.id === variant.id;
                                return (
                                    <button 
                                        key={variant.id} 
                                        onClick={() => handleVariantChange(product.id, variant.id)} 
                                        className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 transition-all duration-300 ${
                                            isSelected 
                                            ? 'bg-red-600 border-red-700 text-white shadow-lg' 
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:shadow-md'
                                        }`}
                                    >
                                        {variant.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-700">
                    {hasVariants ? (
                        <>
                            <span className="text-2xl font-bold text-red-400">₹{currentPrice}</span>
                            <button 
                                onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} 
                                className="flex items-center gap-2 text-white px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:bg-gray-400 transition-all shadow-lg hover:shadow-xl" 
                                disabled={!currentVariant}
                            >
                                <ShoppingCart size={16} /> Add to Cart
                            </button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center">Coming Soon</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden animate-pulse">
        <div className="w-full aspect-[4/3] bg-gray-700"></div>
        <div className="p-5">
            <div className="h-6 bg-gray-700 rounded w-4/5 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-5"></div>
            <div className="h-4 bg-gray-700 rounded w-3/5 mb-5"></div>
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-700 rounded-full w-2/5"></div>
            </div>
        </div>
    </div>
);

export default function HomePage({ handleAddToCart }) {
    // --- Enhanced STATE MANAGEMENT for Better UX ---
    const [products, setProducts] = useState([]); 
    const [categories, setCategories] = useState(CATEGORY_ORDER);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
            setError('');
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const productGridVariants = {
        visible: { transition: { staggerChildren: 0.08 } },
        hidden: {}
    };

    const currentBannerData = categoryBanners[selectedCategory];
    const currentFeatureData = categoryFeatures[selectedCategory];

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const productsBeforeBanner = currentPage === 1 ? filteredProducts.slice(0, BANNER_POSITION) : filteredProducts;
    const productsAfterBanner = currentPage === 1 ? filteredProducts.slice(BANNER_POSITION) : [];

    const sidebarVariants = {
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
                body { font-family: 'Poppins', sans-serif; }
                .text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }
                .shadow-3xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
            `}</style>

            {/* Enhanced Full-Screen Video Background with Overlay */}
            <AnimatePresence>
                {categoryVideos[selectedCategory] && (
                    <motion.video 
                        key={selectedCategory} 
                        src={categoryVideos[selectedCategory]} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="fixed inset-0 w-full h-full object-cover -z-20 filter blur-sm scale-105"
                    />
                )}
            </AnimatePresence>
            <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/80 -z-10"></div>

            {/* Sidebar Menu with Enhanced Styling */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-xl shadow-2xl z-50 p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <img src={logoIcon} alt="Sresta Mart Logo" className="h-14 w-auto"/>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-800/50 rounded-full">
                                    <X className="text-gray-200" size={24} />
                                </button>
                            </div>
                            <nav className="flex-grow">
                                <h3 className="text-base font-bold text-gray-300 uppercase tracking-widest mb-4">Discover Categories</h3>
                                <ul className="space-y-3">
                                    {categories.map(category => (
                                        <li key={category}>
                                            <button 
                                                onClick={() => handleFilterChange(category)}
                                                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
                                                    selectedCategory === category 
                                                    ? 'bg-red-600/80 text-white shadow-md' 
                                                    : 'text-gray-200 hover:bg-gray-800/80 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {categoryIcons[category]}
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </div>
                                                <ChevronRight size={20} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <hr className="my-8 border-gray-700" />
                                <h3 className="text-base font-bold text-gray-300 uppercase tracking-widest mb-4">Quick Access</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="/vendor" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold text-gray-200 hover:bg-gray-800/80 transition-all">
                                            <User size={20} /> Vendor Portal
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/delivery/login" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold text-gray-200 hover:bg-gray-800/80 transition-all">
                                            <Truck size={20} /> Delivery Hub
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <div className="pt-10 sm:pt-16 pb-8 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex flex-row items-center justify-center mb-10 relative px-6">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 rounded-full backdrop-blur-md shadow-md hover:bg-black/80 transition-all"
                        >
                            <Menu className="text-white" size={24}/>
                        </button>
                        <div className="flex items-center gap-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.8, ease: "easeOut" }} 
                                className="hidden sm:block"
                            >
                                <img src={logoIcon} alt="Sresta Mart Logo" className="h-24 md:h-28 w-auto shadow-lg rounded-full"/>
                            </motion.div>
                            <motion.h2 
                                initial={{opacity: 0, y: -30}} 
                                animate={{opacity: 1, y: 0}} 
                                transition={{ delay: 0.3, duration: 0.8 }} 
                                className="text-5xl sm:text-6xl font-extrabold text-white text-shadow text-center tracking-tight"
                            >
                                Discover Our Premium Collection
                            </motion.h2>
                        </div>
                    </div>
                    <div className="mt-10 hidden sm:flex justify-center flex-wrap gap-4 px-6">
                        {categories.map(category => (
                            <motion.button 
                                key={category} 
                                onClick={() => handleFilterChange(category)}
                                whileHover={{ scale: 1.08, boxShadow: '0 0 15px rgba(255,0,0,0.3)' }}
                                whileTap={{ scale: 0.92 }}
                                className={`px-5 py-3 rounded-full flex items-center gap-3 text-base font-semibold transition-all duration-300 shadow-md ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                                        : 'bg-gray-800/80 text-gray-100 hover:bg-gray-700/80 backdrop-blur-md'
                                }`}
                            >
                                {categoryIcons[category]}
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                    {/* Added Search Bar for Better UX */}
                    <div className="mt-8 max-w-2xl mx-auto px-6">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-4 px-6 pr-12 rounded-full bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md backdrop-blur-sm"
                            />
                            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Main Content with Enhanced Layout */}
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-600/20 backdrop-blur-md text-red-300 p-5 rounded-xl mb-10 text-center shadow-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Product Grid and Banner with Improved Animations */}
                    <motion.div
                        key={selectedCategory + searchQuery} // Key for re-render on changes
                        variants={productGridVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
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

                    {/* Enhanced Pagination */}
                    {!productsLoading && totalPages > 1 && (
                        <div className="mt-16 flex justify-center items-center gap-6">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-900 hover:to-black shadow-md hover:shadow-lg transition-all"
                            >
                                Previous
                            </button>
                            <span className="px-6 py-3 text-white text-shadow bg-black/50 rounded-full shadow-md">
                                Page {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-900 hover:to-black shadow-md hover:shadow-lg transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Category Features Section with Added Effects */}
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