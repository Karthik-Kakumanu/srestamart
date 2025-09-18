// src/components/Layout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logoUrl from '../../images/icon.png';
import { Home, ShoppingCart, Tag, User } from 'lucide-react';

export default function Layout({ loggedInUser, handleLogout, cartItems }) {
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeLinkStyle = { color: '#dc2626' }; // Tailwind's red-600

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/70 backdrop-blur-sm shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="Sresta Mart Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sresta Mart</h1>
            <p className="text-sm text-gray-600">👋 Hello, {loggedInUser.name}!</p>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">Log Out</button>
      </header>

      <Outlet />

      <footer className="sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-2 z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500">
            <Home /><span className="text-xs font-bold mt-1">Home</span>
          </NavLink>
          <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500">
            {cartItemCount > 0 && <span className="absolute top-1 right-3.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
            <ShoppingCart /><span className="text-xs font-bold mt-1">Cart</span>
          </NavLink>
          <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500">
            <Tag /><span className="text-xs font-bold mt-1">Coupons</span>
          </NavLink>
          <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500">
            <User /><span className="text-xs font-bold mt-1">Account</span>
          </NavLink>
        </div>
      </footer>
    </div>
  );
}