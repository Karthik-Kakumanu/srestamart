import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, ShoppingCart, Info
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Constants, Icons, and Banners ---
const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];

const categoryIcons = {
    livebirds: <Egg size={18} className="text-current" />,
    pickles: <CookingPot size={18} className="text-current" />,
    dairy: <Milk size={18} className="text-current" />,
    dryfruits: <Leaf size={18} className="text-current" />,
    oils: <Leaf size={18} className="text-current" />,
    millets: <Wheat size={18} className="text-current" />,
    meat: <Beef size={18} className="text-current" />,
};

const categoryBanners = {
    livebirds: {
        title: "Nature’s Power Pack for Women",
        text: "Our <strong>Natu Kodi Eggs</strong> are a commitment to health, delivering Omega fatty acids & vital nutrients to support hormonal balance, improve memory, and boost energy. Experience the difference in every bite!",
        imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    pickles: {
        title: "A Taste of Tradition in Every Jar",
        text: "Handcrafted with authentic recipes and the freshest ingredients, our pickles bring the timeless flavors of home to your table. Tangy, spicy, and irresistibly delicious. Perfect with any meal!",
        imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dairy: {
        title: "Pure, Fresh & Delivered Daily",
        text: "From creamy yogurts to rich, pure ghee, our dairy products are sourced from local farms, ensuring unparalleled freshness and nutritional value for your family. Taste the purity, feel the health!",
        imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    dryfruits: {
        title: "Nature's Finest Superfoods",
        text: "Packed with energy and wholesome goodness, our premium selection of dry fruits and nuts are the perfect healthy snack for any time of the day. Fuel your body naturally!",
        imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    oils: {
        title: "Cold-Pressed Purity for a Healthier You",
        text: "Experience the authentic flavor and health benefits of our traditionally extracted, cold-pressed oils. Pure, unadulterated, and perfect for wholesome cooking. Elevate your dishes naturally!",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXazaU1EBSkr4Hctcq7lWC3nXZDdtaVLz2w&s"
    },
    millets: {
        title: "The Ancient Grain for Modern Health",
        text: "Rediscover the power of millets. Our range of ancient grains is rich in fiber and nutrients, making them a perfect, healthy choice for a balanced diet. Embrace tradition for better health!",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    meat: {
        title: "Premium Quality Meats, Freshly Sourced",
        text: "Experience the finest selection of fresh, high-quality meats, responsibly sourced and prepared to perfection. Delicious, tender, and wholesome for your family meals.",
        imageUrl: "https://images.pexels.com/photos/616335/pexels-photo-616335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
};

const categoryFeatures = {
    livebirds: {
        title: "The Power of Natu Kodi Eggs",
        subtitle: `"Healthy is always wealthy for our girl child, girls and women's"`,
        description: "Our Natu Kodi eggs are a powerhouse of nutrition, specially chosen for their incredible health benefits. Each egg is a step towards a healthier lifestyle for women and children.",
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Balance", text: "Rich in Omega fatty acids, essential for helping girls and women maintain hormonal balance and overall well-being." },
            { icon: <Bone className="text-red-500"/>, title: "Rich in Calcium", text: "Packed with natural calcium to support strong bones at every stage of life, crucial for growing children and women." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Boosts Memory Power", text: "An excellent source of Vitamin B12, which is proven to improve memory and cognitive function in children, aiding their development." }
        ]
    },
    pickles: {
        title: "Authentic Homemade Flavors",
        subtitle: `"A taste of tradition in every bite."`,
        description: "Our pickles are made using timeless family recipes and natural preservation techniques, ensuring every jar is packed with authentic taste and goodness. A culinary journey back to your roots.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8m41uJaxOcN9ZVxI78lDW_OFxL6g6E-mTig&s",
        features: [
            { icon: <Microscope className="text-red-500"/>, title: "Probiotic Rich", text: "Naturally fermented pickles are a great source of probiotics that promote a healthy gut and enhance digestion." },
            { icon: <Leaf className="text-red-500"/>, title: "Natural Ingredients", text: "Made with sun-dried ingredients and pure oils, free from any artificial preservatives or harmful chemicals." },
            { icon: <Shield className="text-red-500"/>, title: "Boosts Immunity", text: "Rich in antioxidants and essential vitamins like Vitamin K that help strengthen the immune system, keeping you healthy." }
        ]
    },
    dairy: {
        title: "Farm-Fresh Goodness, Directly to You",
        subtitle: `"Pure, creamy, and delivered from local farms."`,
        description: "Experience the unmatched taste and quality of our dairy products, from pure A2 milk to rich, golden ghee, essential for a healthy lifestyle. Sourced with care, delivered with freshness.",
        imageUrl: "https://images.pexels.com/photos/799273/pexels-photo-799273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Bone className="text-red-500"/>, title: "Rich in Protein & Calcium", text: "Essential for building strong bones, teeth, and promoting healthy muscle development for all ages." },
            { icon: <Sun className="text-red-500"/>, title: "Source of Vitamin D", text: "Our fortified dairy products help your body absorb calcium and support immune function, vital for overall health." },
            { icon: <Droplets className="text-red-500"/>, title: "Pure and Unadulterated", text: "We guarantee purity with no added hormones or preservatives, just natural goodness from happy cows." }
        ]
    },
    dryfruits: {
        title: "Nature's Nutrient-Dense Snack",
        subtitle: `"Your daily dose of energy and wellness."`,
        description: "Our handpicked selection of premium dry fruits and nuts are packed with vitamins, minerals, and healthy fats for a perfect, guilt-free snack. A delicious way to boost your daily nutrition.",
        imageUrl: "https://images.pexels.com/photos/2983141/pexels-photo-2983141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Heart Healthy", text: "Loaded with healthy fats, fiber, and antioxidants that support cardiovascular health, promoting a strong heart." },
            { icon: <BatteryCharging className="text-red-500"/>, title: "Energy Booster", text: "A natural source of quick energy, making them a perfect pre-workout or afternoon snack to keep you going." },
            { icon: <Sparkles className="text-red-500"/>, title: "Rich in Vitamins & Minerals", text: "An excellent source of essential nutrients like potassium, magnesium, and iron, crucial for body functions." }
        ]
    },
    oils: {
        title: "Cold-Pressed Liquid Gold for Your Kitchen",
        subtitle: `"Purity in every single drop."`,
        description: "Extracted using traditional cold-press methods, our oils retain their natural nutrients, flavor, and aroma, making your meals healthier and tastier. Experience the difference in quality.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlD8qSZ1Qpf6F_pTnhy_snOlaPyGqLEB3YbQ&s",
        features: [
            { icon: <TestTube className="text-red-500"/>, title: "Retains Nutrients", text: "Cold-pressing ensures that vital vitamins and antioxidants are preserved, unlike industrially refined oils." },
            { icon: <Heart className="text-red-500"/>, title: "Rich in Healthy Fats", text: "Abundant in monounsaturated and polyunsaturated fats, which are beneficial for heart health and cholesterol levels." },
            { icon: <FilterX className="text-red-500"/>, title: "100% Chemical-Free", text: "Absolutely no chemicals or solvents are used in the extraction process, ensuring ultimate purity and natural goodness." }
        ]
    },
    millets: {
        title: "The Ancient Supergrain for Modern Living",
        subtitle: `"Rediscover the wholesome power of millets."`,
        description: "Gluten-free and rich in fiber, millets are a fantastic, low-glycemic alternative to rice and wheat, perfect for managing a healthy lifestyle and dietary needs.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUCfJOmuHsF_FNrRaSTIE96Q9ToAH9sGF7Q&s",
        features: [
            { icon: <Wheat className="text-red-500"/>, title: "High in Dietary Fiber", text: "Promotes healthy digestion, helps in weight management, and keeps you feeling full longer, aiding your diet." },
            { icon: <Vegan className="text-red-500"/>, title: "Naturally Gluten-Free", text: "An excellent choice for individuals with celiac disease or gluten sensitivity, offering a healthy alternative." },
            { icon: <Activity className="text-red-500"/>, title: "Manages Blood Sugar", text: "With a low glycemic index, millets help in preventing spikes in blood sugar levels, beneficial for diabetics." }
        ]
    },
    meat: {
        title: "Premium & Fresh Meats",
        subtitle: `"Quality you can taste, freshness you can trust."`,
        description: "Our selection of premium meats is sourced from trusted farms, ensuring ethical practices and exceptional quality. Perfect for all your culinary creations, from everyday meals to special occasions.",
        imageUrl: "https://images.pexels.com/photos/10174094/pexels-photo-10174094.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Beef className="text-red-500"/>, title: "High Protein Content", text: "Essential for muscle growth and repair, keeping you strong and active." },
            { icon: <Shield className="text-red-500"/>, title: "Rich in Iron & Zinc", text: "Boosts immunity and supports overall bodily functions, promoting vitality." },
            { icon: <Sparkles className="text-red-500"/>, title: "Ethically Sourced", text: "From farms committed to animal welfare and sustainable practices, ensuring responsible consumption." }
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
        className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-8 rounded-3xl shadow-2xl overflow-hidden relative transform transition-all duration-300 hover:shadow-red-500/30 ring-1 ring-white/10"
        style={{ perspective: 1000 }} // For 3D effect on hover
        whileHover={{ rotateY: 3, scale: 1.01 }}
    >
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10 brightness-75" />
        <div className="bg-gradient-to-br from-black/80 to-black/50 w-full h-full p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-2xl">
                <motion.h3 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-white text-3xl md:text-4xl font-extrabold leading-tight" 
                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
                >
                    {title}
                </motion.h3>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="mt-3 text-lg text-gray-200" 
                    dangerouslySetInnerHTML={{ __html: text }} 
                />
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)" }} 
                    whileTap={{ scale: 0.95 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="mt-6 bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-all shadow-lg text-lg"
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
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="py-16 px-4 mt-20 rounded-3xl bg-black/70 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 relative overflow-hidden"
    >
        {/* Decorative subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-purple-900/10 z-0"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, amount: 0.3 }} 
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            >
                <h2 className="text-5xl font-extrabold text-white leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>{title}</h2>
                <p className="mt-3 text-red-400 font-semibold italic text-xl">{subtitle}</p>
                <p className="mt-5 text-gray-300 text-lg leading-relaxed">{description}</p>
                <div className="mt-10 space-y-7">
                    {Array.isArray(features) && features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            className="flex items-start"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            <div className="flex-shrink-0 w-14 h-14 bg-red-600/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/50 shadow-lg">
                                {React.cloneElement(feature.icon, { size: 28 })}
                            </div>
                            <div className="ml-5">
                                <h4 className="font-bold text-xl text-white">{feature.title}</h4>
                                <p className="mt-1 text-gray-300 text-base">{feature.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true, amount: 0.3 }} 
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }} 
                className="relative h-96 lg:h-[500px] rounded-3xl shadow-2xl overflow-hidden group"
            >
                <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl flex items-end p-6">
                    <p className="text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                        Discover the wholesome benefits.
                    </p>
                </div>
            </motion.div>
        </div>
    </motion.section>
);

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleViewDetails }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';

    return (
        <motion.div 
            variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }} 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(239, 68, 68, 0.2)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden transform border border-gray-800 flex flex-col group relative"
        >
            <div className="w-full aspect-[4/3] overflow-hidden rounded-t-3xl">
                <img 
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-300 flex-grow leading-relaxed mb-3">{product.description}</p>
                <div className="mt-auto mb-3 min-h-[40px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => {
                                const isSelected = currentVariant?.id === variant.id;
                                return (
                                    <motion.button 
                                        key={variant.id} 
                                        onClick={() => handleVariantChange(product.id, variant.id)} 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-red-600 border-red-700 text-white shadow-md' 
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-red-500'
                                        }`}
                                    >
                                        {variant.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                    {hasVariants ? (
                        <>
                            <span className="text-2xl font-extrabold text-red-400">₹{currentPrice}</span>
                            <motion.button 
                                onClick={(e) => handleViewDetails({ ...product, selectedVariant: currentVariant }, e)} 
                                whileHover={{ scale: 1.05, boxShadow: "0 6px 15px rgba(239, 68, 68, 0.3)" }} 
                                whileTap={{ scale: 0.95 }}
                                className="text-white px-4 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2" 
                                disabled={!currentVariant}
                            >
                                <Info size={18} /> View Details
                            </motion.button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center py-2">Currently Unavailable</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden animate-pulse border border-gray-800">
        <div className="w-full aspect-[4/3] bg-gray-800 rounded-t-3xl"></div>
        <div className="p-5">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-5"></div> {/* For variants */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <div className="h-7 bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-700 rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);

export default function HomePage({ handleAddToCart }) { // handleAddToCart is still passed but not directly used by ProductCard
    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState([]); 
    const [categories] = useState(CATEGORY_ORDER); // categories can be constant now
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Ref for scrolling to the product grid
    const productGridRef = useRef(null);

    const BANNER_POSITION = 4; // Position to insert the banner

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
                setError('Failed to load products. ' + (err.response?.data?.message || err.message || ''));
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
        // Scroll to product grid after category changes and products load
        setTimeout(() => {
            productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // Small delay to allow category change to register
    };

    const handleViewDetails = (product, e) => {
        e.stopPropagation(); // Prevent card click event if any
        console.log("View details for:", product);
        // Implement navigation to a product details page
        // e.g., navigate(`/product/${product.id}`, { state: { product, selectedVariant: product.selectedVariant } });
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
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
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
        <div className="relative min-h-screen font-sans bg-gray-950">
            <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8); }`}</style>

            {/* Full-Screen Video Background */}
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
                        className="fixed inset-0 w-full h-full object-cover -z-20"
                    />
                )}
                        </AnimatePresence>
            <div className="fixed inset-0 bg-black/60 -z-10"></div> {/* Darker overlay */}

            {/* Sidebar Menu */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/70 z-40 cursor-pointer"
                        />
                        <motion.div
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl shadow-2xl z-50 p-6 flex flex-col border-r border-gray-800"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <motion.img 
                                    src={logoIcon} 
                                    alt="Sresta Mart Logo" 
                                    className="h-14 w-auto drop-shadow-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                />
                                <motion.button 
                                    onClick={() => setIsSidebarOpen(false)} 
                                    className="p-2 rounded-full bg-gray-800/50 hover:bg-red-600 transition-colors duration-300"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="text-white" />
                                </motion.button>
                            </div>
                            <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2"> {/* Added custom-scrollbar */}
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Product Categories</h3>
                                <ul className="space-y-3">
                                    {categories.map(category => (
                                        <motion.li 
                                            key={category}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            className="rounded-lg"
                                        >
                                            <button 
                                                onClick={() => handleFilterChange(category)}
                                                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg text-md font-medium transition-colors duration-200 group ${
                                                    selectedCategory === category 
                                                    ? 'bg-red-600 text-white shadow-lg' 
                                                    : 'text-gray-200 hover:bg-gray-800 hover:text-red-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {React.cloneElement(categoryIcons[category], { 
                                                        className: selectedCategory === category ? 'text-white' : 'text-red-400 group-hover:text-red-300' 
                                                    })}
                                                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                                </div>
                                                <ChevronRight size={18} className={`${selectedCategory === category ? 'text-white' : 'text-gray-500 group-hover:text-red-300'}`} />
                                            </button>
                                        </motion.li>
                                    ))}
                                </ul>
                                <hr className="my-8 border-gray-700" />
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Portals</h3>
                                <ul className="space-y-3">
                                    <motion.li whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' }} whileTap={{ scale: 0.98 }} className="rounded-lg">
                                        <a href="/vendor" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-md font-medium text-gray-200 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200">
                                            <User size={18} className="text-red-400" /> Vendor
                                        </a>
                                    </motion.li>
                                    <motion.li whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' }} whileTap={{ scale: 0.98 }} className="rounded-lg">
                                        <a href="/delivery/login" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-md font-medium text-gray-200 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200">
                                            <Truck size={18} className="text-red-400" /> Delivery
                                        </a>
                                    </motion.li>
                                </ul>
                            </nav>
                            {/* Sidebar Footer/Branding */}
                            <div className="mt-8 text-center text-gray-500 text-sm">
                                <p>&copy; {new Date().getFullYear()} Sresta Mart</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10 min-h-screen flex flex-col">
                <header className="py-6 sm:py-8 bg-black/80 backdrop-blur-xl shadow-lg border-b border-gray-800">
                    <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
                        {/* Mobile Menu Button */}
                        <motion.button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-3 bg-red-600/20 rounded-full backdrop-blur-sm border border-red-500/50 hover:bg-red-600/40 transition-colors lg:hidden flex items-center justify-center shadow-md"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Menu className="text-white" size={24}/>
                        </motion.button>

                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4 md:space-x-6 mx-auto lg:mx-0">
                            <motion.img 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ duration: 0.6, ease: "easeOut" }} 
                                src={logoIcon} 
                                alt="Sresta Mart Logo" 
                                className="h-16 md:h-20 w-auto drop-shadow-xl"
                            />
                            <motion.h2 
                                initial={{opacity: 0, y: -20}} 
                                animate={{opacity: 1, y: 0}} 
                                transition={{ delay: 0.2, duration: 0.7 }} 
                                className="text-4xl sm:text-5xl font-extrabold text-white text-shadow text-center leading-tight tracking-wide"
                            >
                                Sresta Mart
                            </motion.h2>
                        </div>
                        
                        {/* Cart Button */}
                        <motion.button
                            onClick={() => console.log('Go to Cart')} // Replace with actual cart navigation
                            className="p-3 bg-red-600/20 rounded-full backdrop-blur-sm border border-red-500/50 hover:bg-red-600/40 transition-colors flex items-center justify-center shadow-md"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ShoppingCart className="text-white" size={24}/>
                        </motion.button>
                    </div>

                    {/* Desktop Category Navigation */}
                    <div className="mt-8 hidden lg:flex justify-center flex-wrap gap-4 px-4 max-w-7xl mx-auto">
                        {categories.map(category => (
                            <motion.button 
                                key={category} 
                                onClick={() => handleFilterChange(category)}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-base font-semibold transition-all duration-300 border ${
                                    selectedCategory === category
                                        ? 'bg-red-600 text-white shadow-xl border-red-700'
                                        : 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/70 backdrop-blur-sm border-gray-700'
                                }`}
                            >
                                {React.cloneElement(categoryIcons[category], { 
                                    className: selectedCategory === category ? 'text-white' : 'text-red-400' 
                                })}
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100/90 backdrop-blur-sm text-red-700 font-medium p-4 rounded-lg mb-10 text-center border border-red-200 shadow-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Product Grid and Banner */}
                    <motion.div
                        key={selectedCategory + currentPage} // Key for animating grid changes on category/page
                        ref={productGridRef} // Ref for scrolling
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
                                    handleViewDetails={handleViewDetails} // Changed from handleAddToCart
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
                                    handleViewDetails={handleViewDetails} // Changed from handleAddToCart
                                />
                            ))}
                    </motion.div>

                    {/* Pagination */}
                    {!productsLoading && totalPages > 1 && (
                        <div className="mt-16 flex justify-center items-center gap-6">
                            <motion.button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gray-800/70 text-gray-200 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700/70 backdrop-blur-sm transition-colors duration-300 font-semibold text-lg border border-gray-700 shadow-md"
                            >
                                Previous
                            </motion.button>
                            <span className="px-4 py-2 text-white text-xl font-bold text-shadow">
                                Page {currentPage} of {totalPages}
                            </span>
                            <motion.button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gray-800/70 text-gray-200 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700/70 backdrop-blur-sm transition-colors duration-300 font-semibold text-lg border border-gray-700 shadow-md"
                            >
                                Next
                            </motion.button>
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
                </main>

                {/* Footer (Optional, but good for completeness) */}
                <motion.footer 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 py-10 bg-black/80 backdrop-blur-xl border-t border-gray-800 text-gray-400 text-center text-sm"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p>&copy; {new Date().getFullYear()} Sresta Mart. All rights reserved.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <span className="text-gray-600">|</span>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <span className="text-gray-600">|</span>
                            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </div>
    );
}

// Custom Scrollbar CSS (add this to your main CSS file or a style block)
// If you are using Tailwind CSS directly and not a separate CSS file,
// you might need to extend your Tailwind config for custom utilities.
// For simplicity, I'll include it here within a style tag as a comment.
/*
<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(239, 68, 68, 0.5);
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #ef4444;
}
</style>
*/