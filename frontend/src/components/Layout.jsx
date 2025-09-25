import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logoUrl from '../../images/icon.png';
// --- MODIFIED: Added new icons ---
import { Home, ShoppingCart, Tag, User, Phone, MessageCircle, Instagram, MapPin } from 'lucide-react';

export default function Layout({ loggedInUser, handleLogout, cartItems }) {
  const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);

  const activeLinkStyle = { color: '#dc2626' };

  // --- NEW: Address details for the header link ---
  const shopAddress = "HNO 5-34, PLOT NO 1, BUDHA NAGAR ROAD NO 1, PEERZADIGUDA, MEDIPALLY(M), MEDCHAL-MALKAJGIRI (D), TELANGANA - 500039";
  // Corrected Google Maps URL encoding
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-md p-2 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="Sresta Mart Logo" className="h-8 w-auto" />
          <div className="flex-grow">
            <h1 className="text-lg font-bold text-gray-800">Sresta Mart</h1>
            <p className="text-xs text-gray-600"> Hello, {loggedInUser?.name || 'Guest'}!</p>
            
            <a 
              href={googleMapsUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer"
            >
              <MapPin size={12} />
              <span className="truncate max-w-[200px] sm:max-w-full">{shopAddress}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* --- MODIFIED: Revamped Footer for better layout and icons --- */}
      <footer className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-2 z-40">
        <div className="max-w-xl mx-auto flex justify-around items-center h-full"> {/* Increased max-width and adjusted justify */}

          {/* Left Section: Call & WhatsApp */}
          <div className="flex flex-col items-center flex-1 min-w-0"> {/* Use flex-1 to allow stretching */}
            <a href="tel:+919494837550" className="flex flex-col items-center py-1 px-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
              <Phone size={24} className="mb-0.5" /> {/* Increased icon size */}
              <span className="text-xs font-bold">Call</span>
            </a>
            <a href="https://wa.me/919494837550" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center py-1 px-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors mt-1"> {/* Added margin-top */}
              <MessageCircle size={24} className="mb-0.5" /> {/* Increased icon size */}
              <span className="text-xs font-bold">WhatsApp</span>
            </a>
          </div>

          {/* Center Section: Main Navigation Links (Grid for better spacing) */}
          <div className="grid grid-cols-2 grid-rows-2 gap-y-1 gap-x-3 flex-none mx-4"> {/* Use grid for more control */}
            <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
              <Home size={20} /><span className="text-xs font-bold mt-0.5">Home</span>
            </NavLink>
            <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
              {cartItemCount > 0 && <span className="absolute top-0.5 right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
              <ShoppingCart size={20} /><span className="text-xs font-bold mt-0.5">Cart</span>
            </NavLink>
            <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
              <Tag size={20} /><span className="text-xs font-bold mt-0.5">Coupons</span>
            </NavLink>
            <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
              <User size={20} /><span className="text-xs font-bold mt-0.5">Account</span>
            </NavLink>
          </div>

          {/* Right Section: Instagram Links */}
          <div className="flex flex-col items-center flex-1 min-w-0"> {/* Use flex-1 to allow stretching */}
            <Instagram size={24} className="text-gray-500 hover:text-red-500 transition-colors mb-0.5" /> {/* Increased icon size */}
            <a href="https://www.instagram.com/srestamart/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">srestamart</a>
            <a href="https://www.instagram.com/sresta_organic_farms/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors mt-1">sresta_organic</a> {/* Added margin-top */}
          </div>
        </div>
      </footer>
    </div>
  );
}