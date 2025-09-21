import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BrainCircuit, Bone, Loader2 } from 'lucide-react';

// --- Custom Hook for Screen Size ---
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth > 768 : false
    );
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isDesktop;
};

// --- All Components (Header, Cards, Banners, etc.) ---
// These components are unchanged from the previous version.
const Header = () => (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-center sm:justify-start">
                <h1 className="text-4xl font-bold text-red-600">SrestaMart</h1>
            </div>
        </div>
    </header>
);

const MobileProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id];
    const currentVariant = hasVariants ? product.variants.find(v => v.id == selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';
    return (
        <motion.div layout variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group">
            <div className="w-full aspect-square overflow-hidden"><img src={product.image_url || 'https://placehold.co/300x300?text=Sresta+Mart'} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-bold text-sm text-gray-800 leading-tight">{product.name}</h3>
                <div className="mt-2 mb-2 min-h-[30px]">{hasVariants && (<div className="flex items-center gap-1.5 flex-wrap">{product.variants.map(variant => { const isSelected = currentVariant?.id === variant.id; return ( <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all duration-200 ${isSelected ? 'bg-red-600 border-red-700 text-white shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>{variant.label}</button> ); })}</div>)}</div>
                <div className="flex justify-between items-center mt-auto pt-2">{hasVariants ? (<><span className="text-md font-bold text-red-700">₹{currentPrice}</span><button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="text-white px-3 py-1.5 text-xs font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400" disabled={!currentVariant}>Add</button></>) : (<span className="text-xs font-semibold text-gray-500 w-full text-center">Unavailable</span>)}</div>
            </div>
        </motion.div>
    );
};

const DesktopProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id];
    const currentVariant = hasVariants ? product.variants.find(v => v.id == selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';
    return (
        <motion.div layout variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col group">
            <div className="w-full aspect-[4/3] overflow-hidden"><img src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3><p className="text-sm text-gray-600 mt-1 flex-grow">{product.description}</p>
                <div className="mt-3 mb-3 min-h-[34px]">{hasVariants && (<div className="flex items-center gap-2 flex-wrap">{product.variants.map(variant => { const isSelected = currentVariant?.id === variant.id; return ( <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${isSelected ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300'}`}>{variant.label}</button> ); })}</div>)}</div>
                <div className="flex justify-between items-center mt-auto pt-3">{hasVariants ? (<><span className="text-xl font-bold text-red-700">₹{currentPrice}</span><button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="text-white px-4 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-lg" disabled={!currentVariant}>Add to Cart</button></>) : (<span className="text-sm font-semibold text-gray-500 w-full text-center">Currently Unavailable</span>)}</div>
            </div>
        </motion.div>
    );
};

// Data and other components are unchanged, so they are collapsed for brevity
const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets'];
const categoryBanners = {/* ... full data object ... */};
const categoryFeatures = {/* ... full data object ... */};
const CategoryBanner = ({ title, text, imageUrl }) => {/* ... component JSX ... */};
const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => {/* ... component JSX ... */};


// --- MAIN HOME PAGE COMPONENT ---
export default function HomePage({ handleAddToCart }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Assuming categories are fetched or static
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    
    // State for pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    
    const isDesktop = useIsDesktop();
    const observer = useRef();

    // This function is now responsible for fetching products for a given page
    const fetchProducts = useCallback(async (category, pageNum) => {
        setLoading(true);
        setError('');
        try {
            // IMPORTANT: Your API must support `page` and `limit`
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
                params: {
                    category: category,
                    page: pageNum,
                    limit: 8 // Load 8 products at a time
                }
            });
            
            const newProducts = res.data.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));

            setProducts(prev => pageNum === 1 ? newProducts : [...prev, ...newProducts]);
            setHasMore(newProducts.length > 0); // If API returns empty, we have no more pages

            // Initialize variants for new products
            const initialVariants = {};
            newProducts.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    initialVariants[p.id] = p.variants[0].id;
                }
            });
            setSelectedVariants(prev => ({ ...prev, ...initialVariants }));

        } catch (err) {
            setError('Failed to load products. ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch products when the category changes
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(selectedCategory, 1);
        // Assuming categories are static or fetched elsewhere. If not, fetch them here.
        setCategories(CATEGORY_ORDER);
    }, [selectedCategory, fetchProducts]);

    // This sets up the Intersection Observer to detect when the user scrolls to the bottom
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchProducts(selectedCategory, nextPage);
                    return nextPage;
                });
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, selectedCategory, fetchProducts]);

    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
    };

    const handleFilterChange = (category) => {
        if (category === selectedCategory) return;
        setSelectedCategory(category);
    };
    
    const renderProductCard = (product, index) => {
        const cardProps = { product, selectedVariants, handleVariantChange, handleAddToCart };
        // Attach the ref to the last element in the list
        if (products.length === index + 1) {
            return (
                <div ref={lastProductElementRef} key={product.id}>
                    {isDesktop ? <DesktopProductCard {...cardProps} /> : <MobileProductCard {...cardProps} />}
                </div>
            );
        }
        return isDesktop 
            ? <DesktopProductCard key={`${product.id}-desktop`} {...cardProps} /> 
            : <MobileProductCard key={`${product.id}-mobile`} {...cardProps} />;
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header />
            <div className="flex-grow">
                {/* ... (background video and header section) ... */}
                <div className="relative z-10">
                    <div className="pt-6 pb-6 bg-gradient-to-b from-black/40 to-transparent">
                        <motion.h2 initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="text-3xl sm:text-4xl font-bold text-white text-center text-shadow px-4">
                            Explore Our Collection
                        </motion.h2>
                        <div className="mt-6 flex justify-center flex-wrap gap-2 px-4">
                            {categories.map(category => (
                                <button key={category} onClick={() => handleFilterChange(category)} className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${ selectedCategory === category ? `bg-white text-red-600 shadow-lg` : 'bg-white/20 text-white hover:bg-white/40 text-shadow'}`}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <main className="px-3 sm:px-6 py-4 relative z-10">
                    <AnimatePresence>
                        <motion.div layout key={selectedCategory}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                        >
                            {products.map((product, index) => renderProductCard(product, index))}
                        </motion.div>
                    </AnimatePresence>

                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                        </div>
                    )}

                    {error && <div className="text-center text-red-500 py-4">{error}</div>}

                    {!hasMore && !loading && (
                        <div className="text-center text-gray-500 py-8">
                            <p>You've reached the end!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}