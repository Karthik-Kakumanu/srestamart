import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, BrainCircuit, Bone, Egg, Leaf, Milk, Wheat, CookingPot, Beef,
    Microscope, Shield, Sun, Droplets, BatteryCharging, Sparkles, TestTube, FilterX, Vegan, Activity,
    Menu, X, ChevronRight, User, Truck, Search, ShoppingCart, Store
} from 'lucide-react';
import logoIcon from '../../images/icon.png';

// --- MAJOR UPDATE: Category structure and order changed as per your request ---
const CATEGORY_ORDER = ['meatpoultry', 'eggs', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets'];

// --- UPDATE: Icons updated for new category structure ---
const categoryIcons = {
    meatpoultry: <Beef size={18} className="text-red-600" />,
    eggs: <Egg size={18} className="text-yellow-400" />,
    pickles: <CookingPot size={18} className="text-orange-500" />,
    dairy: <Milk size={18} className="text-blue-300" />,
    dryfruits: <Leaf size={18} className="text-green-500" />,
    oils: <Leaf size={18} className="text-amber-600" />,
    millets: <Wheat size={18} className="text-yellow-600" />,
};

// --- UPDATE: Banners updated for new category structure ---
const categoryBanners = {
    eggs: { // Formerly 'livebirds'
        title: "Nature’s Ultimate Power Pack for Women",
        text: "Our <strong>Natu Kodi Eggs</strong> embody a true commitment to wellness, packed with Omega-3 fatty acids & essential nutrients to harmonize hormones, sharpen memory, and skyrocket energy levels.",
        imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    meatpoultry: { // Formerly 'meat'
        title: "Premium Fresh Meats & Poultry",
        text: "Sourced from ethical farms, our high-quality selection offers rich flavors and essential proteins, perfect for creating mouthwatering dishes that nourish and satisfy.",
        imageUrl: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
};

// --- UPDATE: Features updated for new category structure ---
const categoryFeatures = {
    eggs: { // Formerly 'livebirds'
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
    meatpoultry: { // Formerly 'meat'
        title: "Premium Ethical Meats & Poultry",
        subtitle: `"Fresh, flavorful, and responsibly sourced."`,
        description: "Our meats are from sustainable farms, providing high-protein options with rich taste for gourmet cooking.",
        imageUrl: "https://images.pexels.com/photos/618681/pexels-photo-618681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Beef className="text-red-500"/>, title: "Protein Powerhouse", text: "Essential for muscle repair and growth." },
            { icon: <Shield className="text-red-500"/>, title: "Ethical Sourcing", text: "From farms prioritizing animal welfare." },
            { icon: <Sparkles className="text-red-500"/>, title: "Flavorful Variety", text: "Cuts perfect for diverse cuisines." }
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
};

const CategoryBanner = ({ title, text, imageUrl }) => ( <motion.div layout initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="col-span-2 md:col-span-3 lg:col-span-4 my-6 rounded-2xl shadow-lg overflow-hidden relative transform hover:scale-102 transition-transform duration-300" > <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover -z-10 filter brightness-75" /> <div className="bg-gradient-to-r from-black/60 via-black/40 to-transparent w-full h-full p-4 sm:p-8 flex items-center"> <div className="max-w-2xl"> <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>{title}</h3> <p className="mt-3 text-sm sm:text-base text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} /> <motion.button whileHover={{ scale: 1.08, boxShadow: '0 0 10px rgba(255,0,0,0.4)' }} whileTap={{ scale: 0.92 }} className="mt-4 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-full hover:from-red-600 hover:to-red-800 transition-all shadow-md" > Shop Now <ChevronRight size={16} className="inline ml-1" /> </motion.button> </div> </div> </motion.div> );
const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => ( <motion.section key={title} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="py-12 px-4 sm:px-6 mt-12 rounded-2xl bg-black/20 backdrop-blur-lg shadow-lg ring-1 ring-white/10" > <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center"> <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} > <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{title}</h2> <p className="mt-2 text-red-400 font-medium italic text-lg sm:text-xl">{subtitle}</p> <p className="mt-4 text-gray-200 text-sm sm:text-base leading-relaxed">{description}</p> <div className="mt-6 space-y-6"> {Array.isArray(features) && features.map((feature, index) => ( <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex items-start gap-3" > <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shadow-sm"> {React.cloneElement(feature.icon, { size: 24 })} </div> <div> <h4 className="font-semibold text-lg text-white">{feature.title}</h4> <p className="mt-1 text-gray-300 text-sm">{feature.text}</p> </div> </motion.div> ))} </div> </motion.div> <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="relative h-80 md:h-96 rounded-2xl shadow-lg overflow-hidden" > <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover rounded-2xl filter brightness-90" /> <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div> </motion.div> </div> </motion.section> );
const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => { const hasVariants = product.variants && product.variants.length > 0; const selectedVariantId = selectedVariants[product.id] || (hasVariants ? product.variants[0].id : null); const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null; const currentPrice = currentVariant ? currentVariant.price : 'N/A'; return ( <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group" whileHover={{ y: -8 }} > <div className="w-full aspect-[4/3] overflow-hidden relative"> <img src={product.image_url || 'https://placehold.co/400x300?text=Sresta+Mart'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm"> New </div> </div> <div className="p-4 flex flex-col flex-grow"> <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{product.name}</h3> <p className="text-xs text-gray-700 mb-3 flex-grow line-clamp-3">{product.description}</p> <div className="mb-3 min-h-[32px]"> {hasVariants && ( <div className="flex items-center gap-2 flex-wrap"> {product.variants.map(variant => { const isSelected = currentVariant?.id === variant.id; return ( <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-3 py-1 text-xs font-medium rounded-full border transition-all duration-300 ${ isSelected ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-white/60 border-gray-300 text-gray-800 hover:bg-white/90 hover:shadow-sm' }`} > {variant.label} </button> ); })} </div> )} </div> <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-300/70"> {hasVariants ? ( <> <span className="text-lg font-bold text-red-600">₹{currentPrice}</span> <button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="flex items-center gap-1.5 text-white px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg" disabled={!currentVariant} > <ShoppingCart size={14} /> Add </button> </> ) : ( <span className="text-xs font-medium text-gray-600 w-full text-center">Coming Soon</span> )} </div> </div> </motion.div> ); };
const SkeletonCard = () => ( <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden animate-pulse"> <div className="w-full aspect-[4/3] bg-gray-300"></div> <div className="p-4"> <div className="h-5 bg-gray-300 rounded w-4/5 mb-2"></div> <div className="h-3 bg-gray-300 rounded w-full mb-3"></div> <div className="h-3 bg-gray-300 rounded w-3/5 mb-3"></div> <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300/70"> <div className="h-6 bg-gray-300 rounded w-1/4"></div> <div className="h-8 bg-gray-300 rounded-full w-2/5"></div> </div> </div> </div> );

// --- NEW: Custom sorting order arrays ---
const MEAT_POULTRY_ORDER = [ 'sonali', 'kadaknath', 'turkey', 'guinea fowl', 'duck', 'rabbit', 'goat' ];
const PICKLE_KEYWORD_ORDER = [ 'country chicken', 'chicken', 'mutton', 'prawn', 'fish', 'seafood' ];

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
        eggs: "/videos/eggs.mp4", // Formerly 'livebirds'
        meatpoultry: "/videos/eggs1.mp4", // Formerly 'meat'
        dryfruits: "/videos/dryfruits.mp4",
        dairy: "/videos/dairy.mp4",
        oils: "/videos/oils.mp4",
        millets: "/videos/millets.mp4",
        pickles: "/videos/pickles.mp4",
    };

    useEffect(() => {
        if (!selectedCategory) return;
        const fetchProducts = async () => {
            setProductsLoading(true);
            setError('');
            try {
                // We fetch 'meatpoultry' products using the old 'meat' category slug if the API expects it. Adjust if needed.
                const apiCategory = selectedCategory === 'meatpoultry' ? 'livebirds' : selectedCategory;
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=12&category=${apiCategory}`);
                
                if (res.data && Array.isArray(res.data.products)) {
                    let fetchedProducts = res.data.products.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));

                    // --- NEW: CUSTOM SORTING LOGIC ---
                    if (selectedCategory === 'meatpoultry') {
                        fetchedProducts.sort((a, b) => {
                            const aName = a.name.toLowerCase();
                            const bName = b.name.toLowerCase();
                            const aIndex = MEAT_POULTRY_ORDER.findIndex(keyword => aName.includes(keyword));
                            const bIndex = MEAT_POULTRY_ORDER.findIndex(keyword => bName.includes(keyword));

                            // If item not in order list, push to end
                            if (aIndex === -1) return 1;
                            if (bIndex === -1) return -1;

                            return aIndex - bIndex;
                        });
                    } else if (selectedCategory === 'pickles') {
                        const getRank = (productName) => {
                            const name = productName.toLowerCase();
                            const index = PICKLE_KEYWORD_ORDER.findIndex(keyword => name.includes(keyword));
                            return index === -1 ? PICKLE_KEYWORD_ORDER.length : index; // Items not found go to the end
                        };
                        fetchedProducts.sort((a, b) => getRank(a.name) - getRank(b.name));
                    }
                    // --- END OF CUSTOM SORTING LOGIC ---

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

    const handleVariantChange = (productId, variantId) => { setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) })); };
    const handleFilterChange = (category) => { setSelectedCategory(category); setCurrentPage(1); setIsSidebarOpen(false); };
    const goToNextPage = () => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const goToPreviousPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

    const productGridVariants = { visible: { transition: { staggerChildren: 0.08 } }, hidden: {} };
    const currentBannerData = categoryBanners[selectedCategory];
    const currentFeatureData = categoryFeatures[selectedCategory];
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const productsBeforeBanner = currentPage === 1 ? filteredProducts.slice(0, BANNER_POSITION) : filteredProducts;
    const productsAfterBanner = currentPage === 1 ? filteredProducts.slice(BANNER_POSITION) : [];
    const sidebarVariants = { open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }, closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } } };

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
                body { font-family: 'Poppins', sans-serif; }
                .text-shadow { text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); }
                .shadow-3xl { box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.2); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <AnimatePresence> {categoryVideos[selectedCategory] && ( <motion.video key={selectedCategory} src={categoryVideos[selectedCategory]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: 'easeInOut' }} autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover -z-20 filter blur-sm scale-105" /> )} </AnimatePresence>
            <div className="fixed inset-0 bg-gradient-radial from-red-900/10 via-slate-900/20 to-slate-900/40 -z-10"></div>

            <AnimatePresence> {isSidebarOpen && ( <> <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" /> <motion.div variants={sidebarVariants} initial="closed" animate="open" exit="closed" className="fixed top-0 left-0 h-full w-64 bg-slate-800/80 backdrop-blur-lg shadow-lg z-50 p-6 flex flex-col" > <div className="flex justify-between items-center mb-8"> <img src={logoIcon} alt="Sresta Mart Logo" className="h-12 w-auto"/> <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-700/50 rounded-full"> <X className="text-gray-200" size={20} /> </button> </div> <nav className="flex-grow"> <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Discover Categories</h3> <ul className="space-y-2"> {categories.map(category => ( <li key={category}> <button onClick={() => handleFilterChange(category)} className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${ selectedCategory === category ? 'bg-red-600 text-white shadow-md' : 'text-gray-200 hover:bg-slate-700/50' }`} > <div className="flex items-center gap-3"> {categoryIcons[category]} {category === 'meatpoultry' ? 'Meat & Poultry' : category.charAt(0).toUpperCase() + category.slice(1)} </div> <ChevronRight size={16} /> </button> </li> ))} </ul> <hr className="my-6 border-gray-600" /> <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3> <ul className="space-y-2"> <li> <a href="/vendor" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-slate-700/50 transition-all"> <User size={16} /> Vendor Portal </a> </li> <li> <a href="/delivery/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-slate-700/50 transition-all"> <Truck size={16} /> Delivery Hub </a> </li> <li> <a href="/franchisepage" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-slate-700/50 transition-all"> <Store size={16} /> Franchise </a> </li> </ul> </nav> </motion.div> </> )} </AnimatePresence>

            <div className="relative z-10">
                <div className="pt-8 sm:pt-12 pb-6 bg-gradient-to-b from-black/20 to-transparent">
                    <div className="flex flex-row items-center justify-center mb-8 relative px-4 sm:px-6"> <button onClick={() => setIsSidebarOpen(true)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full backdrop-blur-sm shadow-sm hover:bg-white/30 transition-all" > <Menu className="text-white" size={20}/> </button> <div className="flex items-center gap-3"> <motion.h2 initial={{opacity: 0, y: -30}} animate={{opacity: 1, y: 0}} transition={{ delay: 0.3, duration: 0.8 }} className="text-2xl sm:text-4xl font-bold text-white text-shadow text-center tracking-tight" > Discover Our Premium Collection </motion.h2> </div> </div>

                    <div className="mt-6 flex overflow-x-auto sm:justify-center gap-3 px-4 sm:px-6 no-scrollbar">
                        {categories.map(category => (
                            <motion.button 
                                key={category} 
                                onClick={() => handleFilterChange(category)}
                                whileHover={{ scale: 1.08, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-300 shadow-md ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-red-500 to-red-700 text-white'
                                        : 'bg-white/60 text-gray-900 hover:bg-white/80 backdrop-blur-sm'
                                }`}
                            >
                                {categoryIcons[category]}
                                <span className="whitespace-nowrap">{category === 'meatpoultry' ? 'Meat & Poultry' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-6 max-w-xl mx-auto px-4 sm:px-6"> <div className="relative"> <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-3 px-5 pr-10 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md backdrop-blur-sm text-sm" /> <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" size={18} /> </div> </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {error && ( <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 backdrop-blur-sm text-red-300 p-4 rounded-lg mb-8 text-center shadow-sm text-sm" > {error} </motion.div> )}

                    <motion.div key={selectedCategory + searchQuery} variants={productGridVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" >
                        {productsLoading
                            ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
                            : filteredProducts.map(product => ( <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} /> ))
                        }
                        
                        {currentPage === 1 && currentBannerData && !productsLoading && products.length > BANNER_POSITION && ( <CategoryBanner title={currentBannerData.title} text={currentBannerData.text} imageUrl={currentBannerData.imageUrl} /> )}
                    </motion.div>

                    {!productsLoading && totalPages > 1 && ( <div className="mt-12 flex justify-center items-center gap-4 flex-wrap"> <button onClick={goToPreviousPage} disabled={currentPage === 1} className="px-4 py-2 bg-black/20 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-sm" > Previous </button> <span className="px-4 py-2 text-white text-shadow bg-black/20 rounded-full shadow-sm text-sm"> Page {currentPage} / {totalPages} </span> <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-black/20 text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-sm" > Next </button> </div> )}
                    {currentFeatureData && ( <CategoryFeatureSection title={currentFeatureData.title} subtitle={currentFeatureData.subtitle} description={currentFeatureData.description} imageUrl={currentFeatureData.imageUrl} features={currentFeatureData.features} /> )}
                </div>
            </div>
        </div>
    );
}