import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
//-- CHANGE: Removed unused icons to keep the code clean
import { Heart, BrainCircuit, Bone } from 'lucide-react';

//-- NEW: A dedicated Header component for the big logo. It's sticky to stay at the top.
const Header = () => (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/*-- CHANGE: Centered on mobile, left-aligned on larger screens for better design */}
            <div className="flex h-20 items-center justify-center sm:justify-start">
                {/* You can replace this H1 with your own <img /> tag for the logo */}
                <h1 className="text-4xl font-bold text-red-600">
                    SrestaMart
                </h1>
            </div>
        </div>
    </header>
);


const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets'];

const categoryBanners = {
    livebirds: { title: "Nature’s Power Pack for Women", text: "Our <strong>Natu Kodi Eggs</strong> are a commitment to health, delivering Omega fatty acids & vital nutrients to support hormonal balance, improve memory, and boost energy.", imageUrl: "https://images.pexels.com/photos/235648/pexels-photo-235648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    pickles: { title: "A Taste of Tradition in Every Jar", text: "Handcrafted with authentic recipes and the freshest ingredients, our pickles bring the timeless flavors of home to your table. Tangy, spicy, and irresistibly delicious.", imageUrl: "https://images.pexels.com/photos/4198233/pexels-photo-4198233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    dairy: { title: "Pure, Fresh & Delivered Daily", text: "From creamy yogurts to rich, pure ghee, our dairy products are sourced from local farms, ensuring unparalleled freshness and nutritional value for your family.", imageUrl: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    dryfruits: { title: "Nature's Finest Superfoods", text: "Packed with energy and wholesome goodness, our premium selection of dry fruits and nuts are the perfect healthy snack for any time of the day.", imageUrl: "https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    oils: { title: "Cold-Pressed Purity", text: "Experience the authentic flavor and health benefits of our traditionally extracted, cold-pressed oils. Pure, unadulterated, and perfect for wholesome cooking.", imageUrl: "https://images.pexels.com/photos/33783/olive-oil-olives-bottle-food.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    millets: { title: "The Ancient Grain for Modern Health", text: "Rediscover the power of millets. Our range of ancient grains is rich in fiber and nutrients, making them a perfect, healthy choice for a balanced diet.", imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" }
};

const categoryFeatures = {
    livebirds: { title: "The Power of Natu Kodi Eggs", subtitle: `"Healthy is always wealthy for our girl child, girls and women's"`, description: "Our Natu Kodi eggs are a powerhouse of nutrition, specially chosen for their incredible health benefits.", imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Hormonal Balance", text: "Rich in Omega fatty acids, essential for helping girls and women maintain hormonal balance." }, { icon: <Bone className="text-red-500" />, title: "Rich in Calcium", text: "Packed with natural calcium to support strong bones at every stage of life." }, { icon: <BrainCircuit className="text-red-500" />, title: "Boosts Memory Power", text: "An excellent source of Vitamin B12, which is proven to improve memory and cognitive function in children." }] },
    pickles: { title: "A Symphony of Spice & Tradition", subtitle: "Taste the authentic flavors of home in every jar.", description: "Our pickles are more than just a condiment; they're a cherished tradition. We use sun-ripened ingredients and a secret blend of spices, all handcrafted to perfection.", imageUrl: "https://images.pexels.com/photos/6294248/pexels-photo-6294248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Handcrafted Recipes", text: "Made with love, following timeless recipes passed down through generations." }, { icon: <Bone className="text-red-500" />, title: "Natural Ingredients", text: "No artificial preservatives or colors. Just the pure, tangy goodness of nature." }, { icon: <BrainCircuit className="text-red-500" />, title: "Perfectly Spiced", text: "A masterful blend of spices that delivers a perfect balance of tangy, spicy, and savory." }] },
    dairy: { title: "The Essence of Purity", subtitle: "Wholesome, farm-fresh dairy for your family.", description: "Experience dairy as it's meant to be. Sourced from local, well-cared-for cattle, our products—from rich, creamy ghee to fresh paneer—are a testament to purity and quality.", imageUrl: "https://images.pexels.com/photos/799279/pexels-photo-799279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Locally Sourced", text: "Supporting local farms and bringing you the freshest dairy possible, every single day." }, { icon: <Bone className="text-red-500" />, title: "Nutrient-Rich", text: "Naturally packed with calcium and protein for strong bones and healthy growth." }, { icon: <BrainCircuit className="text-red-500" />, title: "Unprocessed Goodness", text: "Free from additives and preservatives, ensuring you get the most natural taste and benefits." }] },
    dryfruits: { title: "Nature's Wholesome Energy", subtitle: "Premium selections for a healthy lifestyle.", description: "Discover our curated selection of premium dry fruits and nuts, sourced from the finest growers. Each handful is packed with essential nutrients, antioxidants, and natural energy.", imageUrl: "https://images.pexels.com/photos/4022082/pexels-photo-4022082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Nutrient Dense", text: "A rich source of vitamins, minerals, and healthy fats for your well-being." }, { icon: <Bone className="text-red-500" />, title: "Energy Boosting", text: "The perfect natural snack to fuel your day without processed sugars." }, { icon: <BrainCircuit className="text-red-500" />, title: "Heart Healthy", text: "Packed with beneficial fats and fiber that contribute to cardiovascular health." }] },
    oils: { title: "Traditionally Pressed, Naturally Better", subtitle: "The pure essence of nature, bottled for you.", description: "Our oils are extracted using traditional cold-press methods ('ghani' or 'chekku') that preserve the natural nutrients and authentic flavor of the seeds. Unrefined and free from chemicals, our oils are the purest choice for your culinary and wellness needs.", imageUrl: "https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Cold-Pressed", text: "Chemical-free extraction ensures all natural nutrients and antioxidants are retained." }, { icon: <Bone className="text-red-500" />, title: "Unrefined & Pure", text: "We deliver 100% pure oil with no blending or additives for authentic taste and aroma." }, { icon: <BrainCircuit className="text-red-500" />, title: "Rich in Nutrients", text: "Our oils are a great source of healthy fatty acids and vital nutrients for a balanced diet." }] },
    millets: { title: "The Ancient Superfood, Reimagined", subtitle: "Embrace a healthier, more sustainable diet.", description: "Embrace a healthier lifestyle with our diverse range of millets. These ancient super-grains are gluten-free, rich in fiber, and packed with protein. From fluffy idlis to hearty rotis, millets are the versatile, nutritious foundation for modern, healthy living.", imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", features: [{ icon: <Heart className="text-red-500" />, title: "Gluten-Free", text: "An excellent choice for those with gluten sensitivity or celiac disease." }, { icon: <Bone className="text-red-500" />, title: "High in Fiber", text: "Promotes healthy digestion and helps in maintaining stable blood sugar levels." }, { icon: <BrainCircuit className="text-red-500" />, title: "Rich in Protein", text: "A great source of plant-based protein for muscle repair and overall health." }] },
};

//-- CHANGE: Simplified the component for better mobile view
const CategoryBanner = ({ title, text, imageUrl }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        //-- CHANGE: ClassNames adjusted for better mobile spacing and appearance
        className="col-span-2 md:col-span-3 lg:col-span-4 my-4 rounded-xl shadow-lg overflow-hidden relative"
    >
        {/*-- NEW: Added lazy loading for performance. The image won't load until it's visible. */}
        <img src={imageUrl} alt={title} loading="lazy" className="absolute w-full h-full object-cover -z-10" />
        <div className="bg-gradient-to-r from-black/70 to-black/40 w-full h-full p-4 sm:p-6">
            <div className="max-w-xl">
                {/*-- CHANGE: Font sizes are smaller on mobile */}
                <h3 className="text-white text-lg md:text-2xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{title}</h3>
                <p className="mt-1 text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: text }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-3 bg-red-600 text-white font-bold py-2 px-4 rounded-full text-xs sm:text-sm hover:bg-red-700 transition-all shadow-md">Shop Now</motion.button>
            </div>
        </div>
    </motion.div>
);

//-- CHANGE: Simplified the component for better mobile view
const CategoryFeatureSection = ({ title, subtitle, description, imageUrl, features }) => (
    <motion.section key={title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
        //-- CHANGE: Padding and margin adjusted for mobile
        className="py-12 px-4 bg-slate-50 mt-8"
    >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                {/*-- CHANGE: Font sizes are smaller on mobile */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h2>
                <p className="mt-2 text-red-600 font-semibold italic">{subtitle}</p>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">{description}</p>
                <div className="mt-6 space-y-5">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            {/*-- CHANGE: Sizing adjusted for mobile */}
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                {React.cloneElement(feature.icon, { size: 20 })}
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-base text-gray-800">{feature.title}</h4>
                                <p className="mt-1 text-sm text-gray-500">{feature.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative h-72 lg:h-full rounded-xl shadow-xl">
                 {/*-- NEW: Added lazy loading for performance */}
                <img src={imageUrl} alt={title} loading="lazy" className="absolute w-full h-full object-cover rounded-xl" />
            </motion.div>
        </div>
    </motion.section>
);

//-- CHANGE: Completely restyled for a compact, mobile-friendly view
const ProductCard = ({ product, selectedVariants, handleVariantChange, handleAddToCart }) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const selectedVariantId = selectedVariants[product.id];
    const currentVariant = hasVariants ? product.variants.find(v => v.id == selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';
 
    return (
        <motion.div
            layout
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group"
        >
            {/*-- CHANGE: Aspect ratio is now square, better for a 2-column grid */}
            <div className="w-full aspect-square overflow-hidden">
                {/*-- NEW: Added lazy loading for performance */}
                <img src={product.image_url || 'https://placehold.co/300x300?text=Sresta+Mart'} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            {/*-- CHANGE: Padding is reduced for mobile */}
            <div className="p-3 flex flex-col flex-grow">
                {/*-- CHANGE: Font size is smaller and line-height is tighter */}
                <h3 className="font-bold text-sm text-gray-800 leading-tight">{product.name}</h3>
                {/*-- CHANGE: No description shown on mobile to save space, this is a design choice */}
                <div className="mt-2 mb-2 min-h-[30px]">
                    {hasVariants && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {product.variants.map(variant => {
                                const isSelected = currentVariant?.id === variant.id;
                                //-- CHANGE: Button styling is smaller and more compact
                                return ( <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all duration-200 ${isSelected ? 'bg-red-600 border-red-700 text-white shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>{variant.label}</button> );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                    {hasVariants ? (
                        <>
                            <span className="text-md font-bold text-red-700">₹{currentPrice}</span>
                            {/*-- CHANGE: "Add to Cart" button is now just "Add" on mobile */}
                            <button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)} className="text-white px-3 py-1.5 text-xs font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md" disabled={!currentVariant}>Add</button>
                        </>
                    ) : (<span className="text-xs font-semibold text-gray-500 w-full text-center">Unavailable</span>)}
                </div>
            </div>
        </motion.div>
    );
};

//-- REMOVED: The SkeletonCard is no longer needed because we are not showing a loading state.

// --- MAIN HOME PAGE COMPONENT ---
export default function HomePage({ handleAddToCart }) {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    //-- CHANGE: Set the default selected category to the first one in the list
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
    const [error, setError] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const BANNER_POSITION = 4;
    
    const categoryVideos = {
        livebirds: "/videos/eggs.mp4", dryfruits: "/videos/dryfruits.mp4", dairy: "/videos/dairy.mp4",
        oils: "/videos/oils.mp4", millets: "/videos/millets.mp4", pickles: "/videos/pickles.mp4",
        meat: "/videos/meat.mp4",
    };

    useEffect(() => {
        const fetchProducts = async () => {
            //-- REMOVED: setProductsLoading(true) is gone. No more loading state.
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
                if (Array.isArray(res.data)) {
                    const products = res.data.map(p => ({ ...p, category: p.category.toLowerCase().replace(/\s+/g, '') }));
                    setAllProducts(products);
                    
                    const uniqueFetchedCategories = [...new Set(products.map(p => p.category))];
                    const sortedCategories = CATEGORY_ORDER.filter(c => uniqueFetchedCategories.includes(c));
                    setCategories(sortedCategories);

                    //-- CHANGE: Directly filter and set the products for the default category
                    setFilteredProducts(products.filter(p => p.category === (selectedCategory || sortedCategories[0])));

                    const initialVariants = {};
                    products.forEach(p => {
                        if (p.variants && p.variants.length > 0) { initialVariants[p.id] = p.variants[0].id; }
                    });
                    setSelectedVariants(initialVariants);
                } else {
                    setError('Failed to load products. Unexpected data format received.');
                }
            } catch (err) {
                setError('Failed to load products. ' + (err.message || ''));
            }
            //-- REMOVED: finally block with setProductsLoading(false) is gone.
        };
        fetchProducts();
    }, []); //-- This useEffect still runs only once when the component loads.

    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
    };

    //-- CHANGE: This function is now much simpler and faster.
    const handleFilterChange = (category) => {
        setSelectedCategory(category);
        //-- CHANGE: No loading state and no artificial setTimeout delay. It's instant.
        setFilteredProducts(allProducts.filter(p => p.category === category));
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
        //-- NEW: A flex container to hold the new Header and the main content
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <div className="flex-grow">
                <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }`}</style>

                {/*-- NEW: This entire block is wrapped to only show the video on medium screens (md) and up */}
                <div className="hidden md:block">
                    {categoryVideos[selectedCategory] && (
                        <>
                            <video key={selectedCategory} autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover -z-20" style={{ opacity: 0.15 }} />
                            <div className="fixed top-0 left-0 w-full h-full bg-black/30 -z-10"></div>
                        </>
                    )}
                </div>
                
                <div className="relative z-10">
                    <div className="pt-6 pb-6 bg-gradient-to-b from-black/40 to-transparent">
                        <motion.h2 initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="text-3xl sm:text-4xl font-bold text-white text-center text-shadow px-4">
                            Explore Our Collection
                        </motion.h2>
                        <div className="mt-6 flex justify-center flex-wrap gap-2 px-4">
                            {categories.map(category => (
                                //-- CHANGE: Button padding and text size adjusted for mobile
                                <button key={category} onClick={() => handleFilterChange(category)} className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${ selectedCategory === category ? `bg-white text-red-600 shadow-lg` : 'bg-white/20 text-white hover:bg-white/40 text-shadow'}`}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/*-- CHANGE: Padding adjusted for a tighter mobile layout */}
                <main className="px-3 sm:px-6 py-4 relative z-10">
                    {error && <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"><strong className="font-bold">Error:</strong><span className="block sm:inline ml-2">{error}</span></div>}
                    
                    <motion.div
                        layout //-- NEW: Added layout prop for smooth animation when filtering
                        key={selectedCategory}
                        initial="hidden"
                        animate="visible"
                        variants={productGridVariants}
                        //-- CHANGE: This is the key for the mobile layout. 2 columns on mobile, more on bigger screens.
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
                    >
                        {/*-- REMOVED: The conditional logic for `productsLoading` is gone. */}
                        {/*-- We now directly map over the `filteredProducts` array. */}
                        {productsBeforeBanner.map((product) => (
                             //-- NEW: Added unique keys to prevent React warnings
                            <ProductCard key={`${product.id}-before`} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                        ))}
                        
                        <AnimatePresence>
                            {currentBannerData && filteredProducts.length > BANNER_POSITION && <CategoryBanner {...currentBannerData} />}
                        </AnimatePresence>
                        
                        {productsAfterBanner.map((product) => (
                             //-- NEW: Added unique keys to prevent React warnings
                            <ProductCard key={`${product.id}-after`} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                        ))}
                    </motion.div>
                    
                    <AnimatePresence>
                        {/*-- CHANGE: Render the feature section only if there are products to show */}
                        {filteredProducts.length > 0 && currentFeatureData && <CategoryFeatureSection {...currentFeatureData} />}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}