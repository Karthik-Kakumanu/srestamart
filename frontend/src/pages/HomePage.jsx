import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, Search, ShoppingCart
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Constants, Icons, and Banners with Enhanced Visuals ---
const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];

const categoryIcons = {
    livebirds: <Egg size={20} className="text-amber-400" />,
    pickles: <CookingPot size={20} className="text-orange-500" />,
    dairy: <Milk size={20} className="text-blue-300" />,
    dryfruits: <Leaf size={20} className="text-green-500" />,
    oils: <Leaf size={20} className="text-amber-600" />,
    millets: <Wheat size={20} className="text-yellow-600" />,
    meat: <Beef size={20} className="text-red-600" />,
};

const categoryBanners = {
    livebirds: {
        title: "Empower Wellness with Natu Kodi Eggs",
        text: "Sourced from free-range farms, our <strong>Natu Kodi Eggs</strong> are packed with Omega-3s and nutrients to boost energy, balance hormones, and enhance memory.",
        imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    pickles: {
        title: "Savor Tradition in Every Jar",
        text: "Crafted with love using ancestral recipes, our pickles deliver bold, tangy flavors with the finest natural ingredients.",
        imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dairy: {
        title: "Pure Bliss from Local Farms",
        text: "Indulge in creamy yogurts and rich ghee, crafted daily from the freshest A2 milk for unparalleled quality.",
        imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dryfruits: {
        title: "Nature’s Finest Superfood Gems",
        text: "Our premium dry fruits and nuts are nutrient-dense snacks, perfect for a healthy boost any time of day.",
        imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    oils: {
        title: "Cold-Pressed Essence of Purity",
        text: "Experience the rich flavor and health benefits of our traditionally extracted, unrefined oils.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXazaU1EBSkr4Hctcq7lWC3nXZDdtaVLz2w&s"
    },
    millets: {
        title: "Ancient Grains, Modern Vitality",
        text: "Our fiber-rich millets are gluten-free, low-GI supergrains, perfect for a balanced, healthy lifestyle.",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    meat: {
        title: "Premium Meats for Culinary Excellence",
        text: "Ethically sourced, our meats offer rich flavors and high protein for gourmet dishes that delight.",
        imageUrl: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
};

const categoryFeatures = {
    livebirds: {
        title: "Natu Kodi Eggs: A Nutritional Powerhouse",
        subtitle: `"Fueling health for women and girls."`,
        description: "Handpicked for their exceptional nutritional profile, our eggs support vitality at every stage.",
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Balance", text: "Omega-3s support hormonal health for women." },
            { icon: <Bone className="text-red-500"/>, title: "Bone Strength", text: "Rich in calcium for robust bones." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Cognitive Boost", text: "Vitamin B12 enhances memory and focus." }
        ]
    },
    pickles: {
        title: "Authentic Pickle Perfection",
        subtitle: `"A burst of heritage in every bite."`,
        description: "Made with traditional methods, our pickles are a probiotic-rich delight for your palate.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8m41uJaxOcN9ZVxI78lDW_OFxL6g6E-mTig&s",
        features: [
            { icon: <Microscope className="text-red-500"/>, title: "Probiotic Boost", text: "Supports gut health with natural fermentation." },
            { icon: <Leaf className="text-red-500"/>, title: "Pure Ingredients", text: "No artificial preservatives, only nature’s best." },
            { icon: <Shield className="text-red-500"/>, title: "Immunity Support", text: "Antioxidants and vitamins strengthen immunity." }
        ]
    },
    dairy: {
        title: "Fresh Dairy, Crafted with Care",
        subtitle: `"From farm to table, pure and simple."`,
        description: "Our dairy products, from A2 milk to ghee, are crafted to nourish and delight daily.",
        imageUrl: "https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Bone className="text-red-500"/>, title: "Protein & Calcium", text: "Supports strong bones and muscles." },
            { icon: <Sun className="text-red-500"/>, title: "Vitamin D", text: "Enhances calcium absorption and immunity." },
            { icon: <Droplets className="text-red-500"/>, title: "Pure Quality", text: "No hormones, just natural goodness." }
        ]
    },
    dryfruits: {
        title: "Premium Dry Fruits & Nuts",
        subtitle: `"Nature’s energy-packed snacks."`,
        description: "Hand-selected for quality, our dry fruits are perfect for healthy, on-the-go snacking.",
        imageUrl: "https://images.pexels.com/photos/2983141/pexels-photo-2983141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Heart Health", text: "Healthy fats and antioxidants for your heart." },
            { icon: <BatteryCharging className="text-red-500"/>, title: "Energy Boost", text: "Quick energy for active lifestyles." },
            { icon: <Sparkles className="text-red-500"/>, title: "Nutrient-Rich", text: "Packed with vitamins and minerals." }
        ]
    },
    oils: {
        title: "Cold-Pressed Oils of Distinction",
        subtitle: `"Pure essence for healthy cooking."`,
        description: "Our oils retain natural flavors and nutrients, elevating your meals with purity.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlD8qSZ1Qpf6F_pTnhy_snOlaPyGqLEB3YbQ&s",
        features: [
            { icon: <TestTube className="text-red-500"/>, title: "Nutrient-Rich", text: "Preserves vitamins and antioxidants." },
            { icon: <Heart className="text-red-500"/>, title: "Healthy Fats", text: "Supports heart health with good fats." },
            { icon: <FilterX className="text-red-500"/>, title: "Chemical-Free", text: "Pure, unrefined extraction process." }
        ]
    },
    millets: {
        title: "Millets: The Supergrain Revival",
        subtitle: `"Ancient wisdom for modern health."`,
        description: "Gluten-free and nutrient-dense, our millets are perfect for a balanced diet.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUCfJOmuHsF_FNrRaSTIE96Q9ToAH9sGF7Q&s",
        features: [
            { icon: <Wheat className="text-red-500"/>, title: "High Fiber", text: "Aids digestion and weight management." },
            { icon: <Vegan className="text-red-500"/>, title: "Gluten-Free", text: "Ideal for gluten-sensitive diets." },
            { icon: <Activity className="text-red-500"/>, title: "Blood Sugar Control", text: "Low GI for stable energy." }
        ]
    },
    meat: {
        title: "Ethically Sourced Premium Meats",
        subtitle: `"Flavorful cuts for gourmet meals."`,
        description: "Our meats are sourced responsibly, offering rich taste and nutrition for your dishes.",
        imageUrl: "https://images.pexels.com/photos/618681/pexels-photo-618681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Beef className="text-red-500"/>, title: "High Protein", text: "Supports muscle growth and repair." },
            { icon: <Shield className="text-red-500"/>, title: "Ethical Sourcing", text: "From farms prioritizing welfare." },
            { icon: <Sparkles className="text-red-500"/>, title: "Rich Flavor", text: "Perfect for diverse cuisines." }
        ]
    }
};

// --- Hero Section with Tagline Rotator ---
const HeroSection = () => {
    const taglines = [
        "Discover Nature’s Finest",
        "Pure, Fresh, and Wholesome",
        "Crafted for Your Wellness",
        "Taste the Tradition"
    ];
    const [currentTagline, setCurrentTagline] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTagline((prev) => (prev + 1) % taglines.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            className="relative py-16 sm:py-24 bg-gradient-to-b from-black/80 to-transparent text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <img src={logoIcon} alt="Sresta Mart Logo" className="h-20 sm:h-28 mx-auto mb-6 rounded-full shadow-lg"/>
            <AnimatePresence mode="wait">
                <motion.h1
                    key={currentTagline}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white text-shadow"
                >
                    {taglines[currentTagline]}
                </motion.h1>
            </AnimatePresence>
            <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                Explore our premium collection of farm-fresh, organic, and artisanal products crafted for your health and happiness.
            </p>
            <motion.button
                whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255,0,0,0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 px-8 rounded-full shadow-xl"
            >
                Shop Now
            </motion.button>
        </motion.div>
    );
};

// --- Category Banner with Parallax Effect ---
const CategoryBanner = ({ title, text, imageUrl }) => (
    <motion.div 
        className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-10 rounded-3xl shadow-2xl overflow-hidden relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
    >
        <motion.img 
            src={imageUrl} 
            alt={title} 
            className="absolute w-full h-full object-cover -z-10"
            whileInView={{ scale: 1.1 }}
            transition={{ duration: 5, ease: 'easeOut' }}
        />
        <div className="bg-gradient-to-r from-black/70 to-transparent p-8 sm:p-12 flex items-center">
            <div className="max-w-3xl">
                <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-shadow">{title}</h3>
                <p className="mt-4 text-lg sm:text-xl text-gray-100" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button 
                    whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255,0,0,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 px-8 rounded-full shadow-xl"
                >
                    Shop Now <ChevronRight size={20} className="inline ml-2" />
                </motion.button>
            </div>
        </div>
    </motion.div>
);

// --- Category Feature Section with Enhanced Visuals ---
const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => (
    <motion.section 
        className="py-20 px-6 mt-16 rounded-3xl bg-gradient-to-b from-black/70 to-black/50 backdrop-blur-xl shadow-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">{title}</h2>
                <p className="mt-3 text-red-400 text-lg italic">{subtitle}</p>
                <p className="mt-6 text-gray-200 text-lg">{description}</p>
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
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100/80 rounded-full flex items-center justify-center shadow-md">
                                {React.cloneElement(feature.icon, { size: 24 })}
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
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-80 lg:h-full rounded-3xl shadow-2xl overflow-hidden"
            >
                <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-3xl" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>
        </div>
    </motion.section>
);

// --- Product Card with Enhanced Hover Effects ---
const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';

    return (
        <motion.div 
            variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            whileHover={{ y: -10, rotate: 1, boxShadow: '0 15px 30px rgba(255,0,0,0.2)' }}
            className="bg-gradient-to-b from-black/70 to-black/50 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden flex flex-col group"
        >
            <div className="w-full aspect-[4/3] overflow-hidden relative">
                <img 
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    New
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-white mb-3">{product.name}</h3>
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
                                            ? 'bg-red-600 border-red-700 text-white shadow-md' 
                                            : 'bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:shadow-sm'
                                        }`}
                                    >
                                        {variant.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700/50">
                    {hasVariants ? (
                        <>
                            <span className="text-2xl font-bold text-red-400">₹{currentPrice}</span>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} 
                                className="flex items-center gap-2 text-white px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:bg-gray-400 shadow-md transition-all"
                                disabled={!currentVariant}
                            >
                                <ShoppingCart size={16} /> Add to Cart
                            </motion.button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center">Coming Soon</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Skeleton Card for Loading ---
const SkeletonCard = () => (
    <div className="bg-gradient-to-b from-black/70 to-black/50 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden animate-pulse">
        <div className="w-full aspect-[4/3] bg-gray-700"></div>
        <div className="p-6">
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

// --- Testimonial Carousel ---
const Testimonials = () => {
    const testimonials = [
        { name: "Priya S.", text: "The Natu Kodi eggs are a game-changer! My family loves their rich taste and nutritional benefits." },
        { name: "Arjun M.", text: "These pickles bring back childhood memories. Authentic and delicious!" },
        { name: "Sneha R.", text: "The dairy products are so fresh and pure. Perfect for my kids!" }
    ];

    return (
        <motion.div 
            className="py-16 px-6 bg-gradient-to-b from-black/60 to-black/40 rounded-3xl shadow-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-10">What Our Customers Say</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4">
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={index}
                        className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 snap-center bg-black/50 backdrop-blur-lg rounded-2xl p-6 shadow-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                        <p className="text-gray-200 italic">"{testimonial.text}"</p>
                        <p className="mt-4 font-semibold text-white">{testimonial.name}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default function HomePage({ handleAddToCart }) {
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
                    setError('Failed to load products. Unexpected data format.');
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
        visible: { transition: { staggerChildren: 0.1 } },
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
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .text-shadow { text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8); }
                .shadow-3xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); }
                .particle-bg {
                    background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                    position: fixed;
                    inset: 0;
                    z-index: -15;
                    opacity: 0.3;
                }
            `}</style>

            {/* Particle Background */}
            <div className="particle-bg"></div>

            {/* Video Background with New Animation */}
            <AnimatePresence>
                {categoryVideos[selectedCategory] && (
                    <motion.video 
                        key={selectedCategory} 
                        src={categoryVideos[selectedCategory]} 
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="fixed inset-0 w-full h-full object-cover -z-20 filter brightness-75"
                    />
                )}
            </AnimatePresence>
            <div className="fixed inset-0 bg-black/40 -z-10"></div>

            {/* Sticky Header */}
            <motion.header 
                className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md shadow-md"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-black/60 rounded-full shadow-md"
                    >
                        <Menu className="text-white" size={24}/>
                    </button>
                    <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 sm:h-16"/>
                    <motion.div 
                        className="relative hidden sm:block"
                        whileHover={{ scale: 1.05 }}
                    >
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="py-2 px-4 pr-10 rounded-full bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </motion.div>
                </div>
            </motion.header>

            {/* Sidebar Menu */}
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
                                <h3 className="text-base font-bold text-gray-300 uppercase tracking-widest mb-4">Categories</h3>
                                <ul className="space-y-3">
                                    {categories.map(category => (
                                        <li key={category}>
                                            <button 
                                                onClick={() => handleFilterChange(category)}
                                                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all ${
                                                    selectedCategory === category 
                                                    ? 'bg-red-600/80 text-white shadow-md' 
                                                    : 'text-gray-200 hover:bg-gray-800/80'
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
                                <h3 className="text-base font-bold text-gray-300 uppercase tracking-widest mb-4">Quick Links</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="/vendor" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold text-gray-200 hover:bg-gray-800/80">
                                            <User size={20} /> Vendor Portal
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/delivery/login" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-semibold text-gray-200 hover:bg-gray-800/80">
                                            <Truck size={20} /> Delivery Hub
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10 pt-20 sm:pt-24">
                {/* Hero Section */}
                <HeroSection />

                {/* Category Filters for Mobile */}
                <div className="sm:hidden px-4 mb-8">
                    <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory">
                        {categories.map(category => (
                            <motion.button 
                                key={category} 
                                onClick={() => handleFilterChange(category)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                                        : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700/80'
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
                            className="bg-red-600/20 text-red-300 p-4 rounded-xl mb-8 text-center shadow-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Product Grid */}
                    <motion.div
                        key={selectedCategory + searchQuery}
                        variants={productGridVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
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
                            <motion.button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                Previous
                            </motion.button>
                            <span className="px-6 py-3 text-white text-shadow bg-black/50 rounded-full">
                                Page {currentPage} / {totalPages}
                            </span>
                            <motion.button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                Next
                            </motion.button>
                        </div>
                    )}

                    {/* Testimonials */}
                    <Testimonials />

                    {/* Category Features */}
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

                {/* Floating Cart Icon for Mobile */}
                <motion.div
                    className="fixed bottom-6 right-6 sm:hidden"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button className="p-4 bg-red-600 text-white rounded-full shadow-lg">
                        <ShoppingCart size={24} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}