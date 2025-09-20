import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BrainCircuit, Bone } from 'lucide-react';

const CATEGORY_ORDER = ['livebirds', 'pickles', 'dairy', 'dryfruits', 'oils', 'millets'];
const PRODUCTS_PER_PAGE = 8; // How many products to load at a time
const BANNER_POSITION = 4;   // Display banner after the 4th product on the first page

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
        imageUrl: "https://images.pexels.com/photos/33783/olive-oil-olives-bottle-food.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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
        imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Hormonal Balance", text: "Rich in Omega fatty acids, essential for helping girls and women maintain hormonal balance." },
            { icon: <Bone className="text-red-500"/>, title: "Rich in Calcium", text: "Packed with natural calcium to support strong bones at every stage of life." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Boosts Memory Power", text: "An excellent source of Vitamin B12, which is proven to improve memory and cognitive function in children." }
        ]
    },
    pickles: {
        title: "A Symphony of Spice & Tradition",
        subtitle: "Taste the authentic flavors of home in every jar.",
        description: "Our pickles are more than just a condiment; they're a cherished tradition. We use sun-ripened ingredients and a secret blend of spices, all handcrafted to perfection.",
        imageUrl: "https://images.pexels.com/photos/6294248/pexels-photo-6294248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Handcrafted Recipes", text: "Made with love, following timeless recipes passed down through generations." },
            { icon: <Bone className="text-red-500"/>, title: "Natural Ingredients", text: "No artificial preservatives or colors. Just the pure, tangy goodness of nature." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Perfectly Spiced", text: "A masterful blend of spices that delivers a perfect balance of tangy, spicy, and savory." }
        ]
    },
    dairy: {
        title: "The Essence of Purity",
        subtitle: "Wholesome, farm-fresh dairy for your family.",
        description: "Experience dairy as it's meant to be. Sourced from local, well-cared-for cattle, our products—from rich, creamy ghee to fresh paneer—are a testament to purity and quality.",
        imageUrl: "https://images.pexels.com/photos/799279/pexels-photo-799279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Locally Sourced", text: "Supporting local farms and bringing you the freshest dairy possible, every single day." },
            { icon: <Bone className="text-red-500"/>, title: "Nutrient-Rich", text: "Naturally packed with calcium and protein for strong bones and healthy growth." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Unprocessed Goodness", text: "Free from additives and preservatives, ensuring you get the most natural taste and benefits." }
        ]
    },
    dryfruits: {
        title: "Nature's Wholesome Energy",
        subtitle: "Premium selections for a healthy lifestyle.",
        description: "Discover our curated selection of premium dry fruits and nuts, sourced from the finest growers. Each handful is packed with essential nutrients, antioxidants, and natural energy.",
        imageUrl: "https://images.pexels.com/photos/4022082/pexels-photo-4022082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Nutrient Dense", text: "A rich source of vitamins, minerals, and healthy fats for your well-being." },
            { icon: <Bone className="text-red-500"/>, title: "Energy Boosting", text: "The perfect natural snack to fuel your day without processed sugars." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Heart Healthy", text: "Packed with beneficial fats and fiber that contribute to cardiovascular health." }
        ]
    },
    oils: {
        title: "Traditionally Pressed, Naturally Better",
        subtitle: "The pure essence of nature, bottled for you.",
        description: "Our oils are extracted using traditional cold-press methods ('ghani' or 'chekku') that preserve the natural nutrients and authentic flavor of the seeds. Unrefined and free from chemicals, our oils are the purest choice for your culinary and wellness needs.",
        imageUrl: "https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Cold-Pressed", text: "Chemical-free extraction ensures all natural nutrients and antioxidants are retained." },
            { icon: <Bone className="text-red-500"/>, title: "Unrefined & Pure", text: "We deliver 100% pure oil with no blending or additives for authentic taste and aroma." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Rich in Nutrients", text: "Our oils are a great source of healthy fatty acids and vital nutrients for a balanced diet." }
        ]
    },
    millets: {
        title: "The Ancient Superfood, Reimagined",
        subtitle: "Embrace a healthier, more sustainable diet.",
        description: "Embrace a healthier lifestyle with our diverse range of millets. These ancient super-grains are gluten-free, rich in fiber, and packed with protein. From fluffy idlis to hearty rotis, millets are the versatile, nutritious foundation for modern, healthy living.",
        imageUrl: "https://images.pexels.com/photos/8992769/pexels-photo-8992769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        features: [
            { icon: <Heart className="text-red-500"/>, title: "Gluten-Free", text: "An excellent choice for those with gluten sensitivity or celiac disease." },
            { icon: <Bone className="text-red-500"/>, title: "High in Fiber", text: "Promotes healthy digestion and helps in maintaining stable blood sugar levels." },
            { icon: <BrainCircuit className="text-red-500"/>, title: "Rich in Protein", text: "A great source of plant-based protein for muscle repair and overall health." }
        ]
    },
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
          <h3 className="text-white text-2xl md:text-3xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            {title}
          </h3>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 bg-slate-50 mt-12"
    >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
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
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
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
    const selectedVariantId = selectedVariants[product.id];
    const currentVariant = hasVariants ? product.variants.find(v => v.id == selectedVariantId) : null;
    const currentPrice = currentVariant ? currentVariant.price : 'N/A';
 
    return (
      <motion.div 
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col group"
      >
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
                    <button key={variant.id} onClick={() => handleVariantChange(product.id, variant.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-2 transition-all duration-200 ${
                        isSelected ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300'
                      }`}>
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
                <button onClick={(e) => handleAddToCart({ ...product, selectedVariant: currentVariant }, e)}
                  className="text-white px-3 py-2 text-sm font-semibold rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
                  disabled={!currentVariant}>
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
  // State for pagination
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Separate loading states for clarity
  const [isInitialLoading, setIsInitialLoading] = useState(true); // For the very first load or category change
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For the "Load More" button

  const [error, setError] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});

  // A single, generic background video for better performance
  const backgroundVideo = "/videos/generic-background.mp4"; 

  // Centralized function to fetch products
  const fetchProductsAndCategories = async (category, page) => {
    // Determine loading state
    if (page === 1) {
      setIsInitialLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');

    try {
      // API call with pagination and category filtering
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
        params: {
          category: category,
          page: page,
          limit: PRODUCTS_PER_PAGE,
        }
      });

      const { products: fetchedProducts, totalPages: fetchedTotalPages, categories: fetchedCategories } = res.data;
      
      // Set categories only on the very first load
      if (categories.length === 0 && fetchedCategories) {
        const sortedCategories = fetchedCategories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
        setCategories(sortedCategories);
        // Set the default category if not already set
        if (!selectedCategory) {
          setSelectedCategory(sortedCategories[0]);
        }
      }

      // Append products if loading more, otherwise replace them
      setProducts(prev => page === 1 ? fetchedProducts : [...prev, ...fetchedProducts]);
      setTotalPages(fetchedTotalPages);
      setCurrentPage(page);

      // Initialize default variants for newly fetched products
      const newVariants = {};
      fetchedProducts.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          newVariants[p.id] = p.variants[0].id;
        }
      });
      setSelectedVariants(prev => ({ ...prev, ...newVariants }));

    } catch (err) {
      setError('Failed to load products. ' + (err.message || 'Please try again.'));
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  };

  // EFFECT: Fetch categories and initial products on component mount
  useEffect(() => {
    const initialCategory = CATEGORY_ORDER[0];
    setSelectedCategory(initialCategory);
    fetchProductsAndCategories(initialCategory, 1);
  }, []); // Runs only once

  // HANDLER: For changing product variants
  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: parseInt(variantId, 10) }));
  };

  // HANDLER: For changing category
  const handleFilterChange = (category) => {
    if (category === selectedCategory) return; // Do nothing if the same category is clicked
    setSelectedCategory(category);
    setProducts([]); // Clear current products immediately for a snappier UI
    fetchProductsAndCategories(category, 1);
  };

  // HANDLER: For the "Load More" button
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchProductsAndCategories(selectedCategory, currentPage + 1);
    }
  };
  
  const productGridVariants = {
    visible: { transition: { staggerChildren: 0.05 } },
    hidden: {}
  };

  const currentBannerData = categoryBanners[selectedCategory];
  const currentFeatureData = categoryFeatures[selectedCategory];

  // Logic to inject banner only on the first page
  const showBanner = currentPage === 1 && products.length > BANNER_POSITION;
  const productsBeforeBanner = showBanner ? products.slice(0, BANNER_POSITION) : products;
  const productsAfterBanner = showBanner ? products.slice(BANNER_POSITION) : [];

  return (
    <div className="flex-grow bg-slate-50">
      <style>{`.text-shadow { text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7); }`}</style>
      
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover -z-20" style={{ opacity: 0.2 }}>
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-10"></div>
      
      <div className="relative z-10">
        <div className="pt-8 sm:pt-12 pb-6 bg-gradient-to-b from-black/50 to-transparent">
            <motion.h2 initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="text-4xl sm:text-5xl font-bold text-white text-center text-shadow">
            Explore Our Collection
            </motion.h2>
            <div className="mt-8 flex justify-center flex-wrap gap-2 px-4">
            {categories.map(category => (
                <button key={category} onClick={() => handleFilterChange(category)} 
                className={`relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category ? `bg-white text-red-600 shadow-lg` : 'bg-white/20 text-white hover:bg-white/40 text-shadow'
                }`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
            ))}
            </div>
        </div>
      </div>
      
      <main className="p-4 sm:p-8 relative z-10">
        {error && <p className="text-center text-red-300 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <motion.div
            key={selectedCategory} // Re-trigger animations when category changes
            initial="hidden"
            animate="visible"
            variants={productGridVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {isInitialLoading ? (
                [...Array(PRODUCTS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
                <>
                    {productsBeforeBanner.map((product) => (
                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                    ))}
                    
                    <AnimatePresence>
                        {showBanner && <CategoryBanner {...currentBannerData} />}
                    </AnimatePresence>
                    
                    {productsAfterBanner.map((product) => (
                        <ProductCard key={product.id} product={product} selectedVariants={selectedVariants} handleVariantChange={handleVariantChange} handleAddToCart={handleAddToCart} />
                    ))}
                </>
            )}
        </motion.div>

        <div className="text-center mt-12">
            { !isInitialLoading && currentPage < totalPages && (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingMore ? "Loading..." : "Load More Products"}
                </motion.button>
            )}
        </div>
        
        <AnimatePresence>
            {!isInitialLoading && currentFeatureData && <CategoryFeatureSection {...currentFeatureData} />}
        </AnimatePresence>
      </main>
    </div>
  );
}