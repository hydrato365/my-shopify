// components/Layout.tsx

import React, { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import LiveSearch from "./LiveSearch";
import DesktopSearch from "./DesktopSearch";
import CartDrawer from "./CartDrawer";
import ThemeSwitcher from "./ThemeSwitcher";

// --- SVG Icons ---
function CartIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>); }
function MenuIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>); }
function SearchIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>); }
function UserIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>); }
function XIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>); }
function ChevronDownIcon({ isDropdownOpen }: { isDropdownOpen: boolean }) { return (<svg className={`h-4 w-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>); }
function BackIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>); }

function ApexLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 80 80" 
      className={className} 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M40 0L0 80H16L40 32L64 80H80L40 0Z" />
    </svg>
  );
}

function Header({ setIsModalOpen, setIsSearchOpen, onCartClick, isScrolled }: { setIsModalOpen: (isOpen: boolean) => void, setIsSearchOpen: (isOpen: boolean) => void, onCartClick: () => void, isScrolled: boolean }) {
    const { state } = useCart();
    const router = useRouter();
    const isHomePage = router.pathname === '/';
    const totalItems = (state.items || []).reduce((total, item) => total + item.quantity, 0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const prevTotalItemsRef = useRef(totalItems);

    useEffect(() => { if (totalItems > prevTotalItemsRef.current) { setIsCartAnimating(true); const timer = setTimeout(() => setIsCartAnimating(false), 300); return () => clearTimeout(timer); } prevTotalItemsRef.current = totalItems; }, [totalItems]);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    useEffect(() => { function handleClickOutside(event: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setIsDropdownOpen(false); } } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [dropdownRef]);

    return (
      <header className="bg-soft-white/90 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="hidden md:block bg-black text-white text-center py-2 text-sm">Free shipping on all orders over $50</div>
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 h-16">
          <div className="flex-1 flex justify-start">
            <div className="md:hidden flex items-center">
              {!isHomePage && (
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-700 dark:text-gray-300" aria-label="Go back">
                  <BackIcon />
                </button>
              )}
              <button onClick={toggleMenu} className={`p-2 ${isHomePage ? '-ml-2' : ''} text-gray-700 dark:text-gray-300`} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>{isMenuOpen ? <XIcon /> : <MenuIcon />}</button>
              {isHomePage && <ThemeSwitcher />}
            </div>
            <div className="hidden md:flex items-center gap-4">
              {!isHomePage && (
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-700 dark:text-gray-300" aria-label="Go back">
                  <BackIcon />
                </button>
              )}
              <Link href="/" className="flex items-center text-gray-900 dark:text-text-light hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <div className={`transition-all duration-300 ease-in-out ${isScrolled || !isHomePage ? 'w-6 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                      <ApexLogo className="h-6 w-6" />
                  </div>
                  <span className={`font-bold transition-all duration-300 ${isScrolled || !isHomePage ? 'text-xl' : 'text-2xl'}`}>
                      Apex Ride
                  </span>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <Link href="/" className="md:hidden flex items-center text-gray-900 dark:text-text-light">
                <div className={`transition-all duration-300 ease-in-out ${isScrolled || !isHomePage ? 'w-5 opacity-100 mr-1.5' : 'w-0 opacity-0'}`}>
                  <ApexLogo className="h-5 w-5" />
                </div>
                <span className={`font-bold transition-all duration-300 ${isScrolled || !isHomePage ? 'text-base' : 'text-xl'}`}>
                    Apex Ride
                </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-base font-medium"><Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">All Products</Link><Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">Snowboards</Link><Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">Apparel</Link><div className="relative" ref={dropdownRef}><button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer" aria-haspopup="true" aria-expanded={isDropdownOpen}>Accessories <ChevronDownIcon isDropdownOpen={isDropdownOpen} /></button>
            <div className={`absolute bg-soft-white dark:bg-gray-800 shadow-lg rounded-md mt-2 py-2 w-48 border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out transform ${isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <Link href="#" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Goggles</Link>
              <Link href="#" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Helmets</Link>
              <Link href="#" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Gloves</Link>
            </div>
          </div></nav></div>
          <div className="flex-1 flex justify-end">
            <div className="md:hidden flex items-center gap-1">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-700 dark:text-gray-300 cursor-pointer" aria-label="Open search"><SearchIcon /></button>
              <button onClick={() => setIsModalOpen(true)} className="p-2 text-gray-700 dark:text-gray-300 cursor-pointer" aria-label="Open account modal"><UserIcon /></button>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <DesktopSearch />
              <ThemeSwitcher />
              <button onClick={() => setIsModalOpen(true)} className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer" aria-label="Open account modal"><UserIcon /></button>
              <button onClick={onCartClick} className={`relative p-2 text-gray-700 dark:text-gray-300 cursor-pointer ${isCartAnimating ? 'animate-pop' : ''}`} aria-label="View shopping cart"><CartIcon />{totalItems > 0 && (<span className="absolute top-0 right-0 block h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1/3 -translate-y-1/3" aria-hidden="true">{totalItems}</span>)}</button>
            </div>
          </div>
        </div>
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-soft-white dark:bg-gray-900 ${isMenuOpen ? 'max-h-96 border-t border-gray-200 dark:border-gray-800' : 'max-h-0'}`}>
          <nav className="flex flex-col p-4 gap-4">
            <Link href="/products" className="font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>All Products</Link>
            <Link href="/products" className="font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>Snowboards</Link>
            <Link href="/products" className="font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>Apparel</Link>
            <Link href="/products" className="font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>Accessories</Link>
            {/* --- START: Conditional Theme Switcher Logic --- */}
            {!isHomePage && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Switch Theme</span>
                <ThemeSwitcher />
              </div>
            )}
            {/* --- END: Conditional Theme Switcher Logic --- */}
          </nav>
        </div>
      </header>
    );
}

function Footer() {
    return (
        <footer className="bg-soft-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">&copy; {new Date().getFullYear()} Apex Ride. All rights reserved.</p>
            </div>
        </footer>
    );
}

function FloatingCartButton({ onCartClick }: { onCartClick: () => void }) { 
    const { state } = useCart(); 
    const totalItems = (state.items || []).reduce((total, item) => total + item.quantity, 0); 
    return ( 
        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { onCartClick(); e.currentTarget.blur(); }} className="md:hidden fixed bottom-5 right-5 z-40 bg-black dark:bg-soft-white text-white dark:text-black p-4 rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300" aria-label="View Cart"> 
            <CartIcon /> 
            {totalItems > 0 && (<span className="absolute -top-1 -right-1 flex justify-center items-center h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full" aria-hidden="true">{totalItems}</span>)} 
        </button> 
    ); 
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter(); 
  const isHomePage = router.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        const productsSection = document.getElementById('latest-products');
        if (productsSection) {
          const triggerPoint = productsSection.offsetTop - 64; 
          if (window.scrollY > triggerPoint) { setIsScrolled(true); } else { setIsScrolled(false); }
        } else { setIsScrolled(false); }
      } else { setIsScrolled(true); }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]); 

  useEffect(() => { setIsClient(true); }, []);
  
  // --- START: HYBRID SCROLL LOCK LOGIC ---
  useEffect(() => {
    const body = document.body;
    if (isSearchOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const hasScrollbar = body.scrollHeight > window.innerHeight;
      if (hasScrollbar) { 
        body.style.paddingRight = `${scrollbarWidth}px`; 
      }
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      return () => {
        const scrollYValue = body.style.top;
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.paddingRight = ''; 
        if (scrollYValue) {
          window.scrollTo(0, parseInt(scrollYValue || '0') * -1);
        }
      };
    }
    if (isModalOpen || isCartOpen) {
      const originalOverflow = window.getComputedStyle(body).overflow;
      const originalPaddingRight = window.getComputedStyle(body).paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isModalOpen, isSearchOpen, isCartOpen]);
  // --- END: HYBRID SCROLL LOCK LOGIC ---
  
  if (!isClient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-soft-white dark:bg-soft-black">
      <Header 
        setIsModalOpen={setIsModalOpen} 
        setIsSearchOpen={setIsSearchOpen} 
        onCartClick={() => setIsCartOpen(true)}
        isScrolled={isScrolled}
      />
      {isSearchOpen && <LiveSearch onClose={() => setIsSearchOpen(false)} />}
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingCartButton onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckoutClick={() => {
          setIsCartOpen(false);
          setIsModalOpen(true);
        }}
      />
      {isModalOpen && ( 
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-soft-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 m-4 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl md:text-2d font-bold text-gray-900 dark:text-text-light mb-3">Sign In / Sign Up</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-6">This is a portfolio demonstration. A full user authentication system can be built upon request.</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-black dark:bg-gray-200 text-white dark:text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors">Got It</button>
          </div>
        </div> 
      )}
    </div>
  );
}