import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, ShoppingCart
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- Centralized Configuration for Categories ---
const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets', 'meat'];

const categoryData = {
    livebirds: {
        icon: <Egg size={16} />,
        video: "/videos/eggs.mp4",
        heroTitle: "Nature’s Power Pack",
        heroSubtitle: "Fresh, organic, and full of vital nutrients.",
    },
    pickles: {
        icon: <CookingPot size={16} />,
        video: "/videos/pickles.mp4",
        heroTitle: "A Taste of Tradition",
        heroSubtitle: "Handcrafted with authentic, timeless recipes.",
    },
    dairy: {
        icon: <Milk size={16} />,
        video: "/videos/dairy.mp4",
        heroTitle: "Pure, Fresh & Delivered Daily",
        heroSubtitle: "Sourced from local farms for unparalleled freshness.",
    },
    dryfruits: {
        icon: <Leaf size={16} />,
        video: "/videos/dryfruits.mp4",
        heroTitle: "Nature's Finest Superfoods",
        heroSubtitle: "Packed with energy and wholesome goodness.",
    },
    oils: {
        icon: <Leaf size={16} />,
        video: "/videos/oils.mp4",
        heroTitle: "Cold-Pressed Purity",
        heroSubtitle: "Experience authentic flavor and health benefits.",
    },
    millets: {
        icon: <Wheat size={16} />,
        video: "/videos/millets.mp4",
        heroTitle: "The Ancient Grain for Modern Health",
        heroSubtitle: "Rich in fiber and essential nutrients.",
    },
    meat: {
        icon: <Beef size={16} />,
        video: "/videos/meat.mp4",
        heroTitle: "Farm-Fresh, Premium Meats",
        heroSubtitle: "Responsibly sourced for the best quality and flavor.",
    }
};

// --- Reusable UI Components ---

const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0 && product.variants.some(v => v.id);
    const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null);
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden flex flex-col group border border-white/10"
        >
            <div className="w-full aspect-square overflow-hidden">
                <img
                    src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow text-white">
                <h3 className="font-bold text-lg h-14">{product.name}</h3>
                <p className="text-sm text-gray-300 mt-1 flex-grow h-16 overflow-hidden">{product.description}</p>
                <div className="mt-4 mb-2 min-h-[34px]">
                    {hasVariants && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.variants.map(variant => (
                                <button
                                    key={variant.id}
                                    onClick={() => handleVariantChange(product.id, variant.id)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${
                                        currentVariant?.id === variant.id
                                            ? 'bg-red-600 border-red-500 text-white shadow-md'
                                            : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                                    }`}
                                >
                                    {variant.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                    {hasVariants ? (
                        <>
                            <span className="text-xl font-bold text-red-400">₹{currentPrice}</span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)}
                                className="text-white px-4 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-500 transition-colors shadow-lg flex items-center gap-2"
                                disabled={!currentVariant}
                            >
                                <ShoppingCart size={16} /> Add
                            </motion.button>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-400 w-full text-center">Unavailable</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse border border-white/10">
        <div className="w-full aspect-square bg-white/10"></div>
        <div className="p-4">
            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-full mb-4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2 mb-6"></div>
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <div className="h-6 bg-white/10 rounded w-1/4"></div>
                <div className="h-9 bg-white/10 rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);


// --- Main HomePage Component ---

export default function HomePage({ handleAddToCart }) {
    // State Management
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch products when category or page changes
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedCategory) return;
            setProductsLoading(true);
            setError('');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=12&category=${selectedCategory}`);
                if (res.data && Array.isArray(res.data.products)) {
                    setProducts(res.data.products);
                    setTotalPages(res.data.totalPages);
                    const initialVariants = {};
                    res.data.products.forEach(p => {
                        if (p.variants && p.variants.length > 0 && p.variants.some(v => v.id)) {
                            initialVariants[p.id] = p.variants.find(v => v.id).id;
                        }
                    });
                    setSelectedVariants(prev => ({ ...prev, ...initialVariants }));
                } else {
                    setError('Failed to load products. Unexpected data format.');
                }
            } catch (err) {
                setError('Failed to load products. Please try again later.');
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, [selectedCategory, currentPage]);

    // Handlers
    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
    };

    const handleFilterChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentCategoryInfo = categoryData[selectedCategory] || categoryData.livebirds;

    return (
        <div className="relative min-h-screen bg-black text-white font-sans">
            {/* Video Background */}
            <AnimatePresence>
                <motion.video
                    key={selectedCategory}
                    src={currentCategoryInfo.video}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    autoPlay loop muted playsInline
                    className="fixed inset-0 w-full h-full object-cover -z-20"
                />
            </AnimatePresence>
            <div className="fixed inset-0 bg-black/60 -z-10"></div>

            {/* Main Content Wrapper */}
            <div className="relative z-10">
                
                {/* Header & Hero Section */}
                <header className="h-[50vh] flex flex-col justify-center items-center text-center px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        className="flex items-center gap-4"
                    >
                        <img src={logoIcon} alt="Sresta Mart Logo" className="h-20 md:h-24 w-auto"/>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                            Sresta Mart
                        </h1>
                    </motion.div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="mt-6"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7)' }}>
                                {currentCategoryInfo.heroTitle}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 mt-2" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                                {currentCategoryInfo.heroSubtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </header>

                {/* Sticky Filter Bar */}
                <div className="sticky top-0 z-30 bg-black/50 backdrop-blur-lg py-3 shadow-2xl border-b border-t border-white/10">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-center">
                           <div className="flex space-x-2 sm:space-x-3 overflow-x-auto p-1 rounded-full">
                                {CATEGORY_ORDER.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleFilterChange(category)}
                                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                                            selectedCategory === category ? "text-white" : "text-gray-300 hover:text-white"
                                        }`}
                                    >
                                        {selectedCategory === category && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-red-600 rounded-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            ></motion.div>
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            {categoryData[category].icon}
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Product Grid Section */}
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {error && (
                        <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-8 text-center border border-red-500/30">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productsLoading
                            ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
                            : products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    selectedVariants={selectedVariants}
                                    handleVariantChange={handleVariantChange}
                                    handleAddToCart={handleAddToCart}
                                />
                            ))}
                    </div>
                </main>

            </div>
        </div>
    );
}