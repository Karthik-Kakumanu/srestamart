import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logoUrl from '../../images/icon.png';
// --- MODIFIED: Icons for new layout ---
import { Home, ShoppingCart, Tag, User, Phone, MapPin } from 'lucide-react';

export default function Layout({ loggedInUser, handleLogout, cartItems }) {
  const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);

  const activeLinkStyle = { color: '#dc2626', fontWeight: 'bold' };

  const shopAddress = "5-34, Road No. 1, Budha Nagar, MEDIPALLY, Mallika Arjun Nagar, Peerzadiguda, Hyderabad, Telangana 500039";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* --- MODIFIED: Header with more attractive address link --- */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md p-2 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="Sresta Mart Logo" className="h-8 w-auto" />
          <div className="flex-grow">
            <h1 className="text-lg font-bold text-gray-800">Sresta Mart</h1>
            <p className="text-xs text-gray-600"> Hello, {loggedInUser?.name || 'Guest'}!</p>
          </div>
        </div>
        <a 
          href={googleMapsUrl}
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <MapPin size={14} />
          <span className="hidden sm:inline">Visit Our Store</span>
        </a>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* --- MODIFIED: Completely revamped footer with three groups and real icons --- */}
      <footer className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-2 px-4 z-40">
        <div className="max-w-2xl mx-auto flex justify-between items-center h-full">

          {/* Group 1: Left Contacts */}
          <div className="flex items-center gap-4">
            <a href="tel:+919494837550" title="Call us" className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors">
              <Phone size={24} />
              <span className="text-xs font-medium">Call</span>
            </a>
            <a href="https://wa.me/919494837550" target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">
              <img src="/icons/whatsapp.png" alt="WhatsApp" className="h-10 w-10" />
            </a>
          </div>

          {/* Group 2: Center Navigation */}
          <div className="flex items-center gap-4">
            <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 text-gray-600 hover:text-red-500">
              <Home size={22} /><span className="text-xs mt-0.5">Home</span>
            </NavLink>
            <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-1 text-gray-600 hover:text-red-500">
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
              <ShoppingCart size={22} /><span className="text-xs mt-0.5">Cart</span>
            </NavLink>
            <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 text-gray-600 hover:text-red-500">
              <Tag size={22} /><span className="text-xs mt-0.5">Coupons</span>
            </NavLink>
            <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 text-gray-600 hover:text-red-500">
              <User size={22} /><span className="text-xs mt-0.5">Account</span>
            </NavLink>
          </div>

          {/* Group 3: Right Socials */}
          <div className="flex items-center gap-2">
             <a href="https://www.instagram.com/srestamart/" target="_blank" rel="noopener noreferrer" title="Visit our Instagram">
                <img src="/icons/instagram.png" alt="Instagram" className="h-10 w-10" />
            </a>
            <div className="flex flex-col">
              <a href="https://www.instagram.com/srestamart/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-600 hover:text-pink-600">srestamart</a>
              <a href="https://www.instagram.com/sresta_organic_farms/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-600 hover:text-pink-600">sresta_organic</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}