import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logoUrl from '../images/icon.png';
import { Home, ShoppingCart, Tag, User } from 'lucide-react';

export default function Layout({ loggedInUser, handleLogout, cartItems }) {
  // This is now 100% safe. If cartItems is undefined, it uses an empty array.
  const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);

  const activeLinkStyle = { color: '#dc2626' };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER: Padding reduced from p-4 to p-2. Logo and font sizes are smaller. */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md p-2 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          {/* Logo size reduced from h-10 to h-8 */}
          <img src={logoUrl} alt="Sresta Mart Logo" className="h-8 w-auto" />
          <div>
            {/* Font size reduced from text-xl to text-lg */}
            <h1 className="text-lg font-bold text-gray-800">Sresta Mart</h1>
            {/* Font size reduced from text-sm to text-xs */}
            <p className="text-xs text-gray-600"> Hello, {loggedInUser?.name || 'Guest'}!</p>
          </div>
        </div>
      </header>

      {/* The flex-grow class makes sure the main content area expands to fill available space */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER: Padding reduced from p-2 to p-1. Padding on links also reduced. */}
      <footer className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-1 z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Padding on each link item reduced from p-2 to p-1 */}
          <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500">
            <Home size={20} /><span className="text-xs font-bold mt-0.5">Home</span>
          </NavLink>
          <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500">
            {/* Badge position adjusted for the new size */}
            {cartItemCount > 0 && <span className="absolute top-0.5 right-2.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
            <ShoppingCart size={20} /><span className="text-xs font-bold mt-0.5">Cart</span>
          </NavLink>
          <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500">
            <Tag size={20} /><span className="text-xs font-bold mt-0.5">Coupons</span>
          </NavLink>
          <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-1 rounded-lg text-gray-500 hover:text-red-500">
            <User size={20} /><span className="text-xs font-bold mt-0.5">Account</span>
          </NavLink>
        </div>
      </footer>
    </div>
  );
}