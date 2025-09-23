'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, User } from 'lucide-react'; // Icons from lucide-react
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
// import { NavItems } from './NavItems';
import { cn } from '@/lib/utils';
import CartIcon from './CartIcon';
import FavoriteButton from './FavoriteButton';
import SearchDialogHandler from './SearchBar';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useUser();

  // Close sidebar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <nav className="sticky top-0 bg-[var(--maroon)] text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Mobile: Hamburger */}
        <div className="lg:hidden flex items-center">
          <button onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo: Left on lg+, Center on mobile */}
        <Link href="/" className="text-2xl font-['Playfair_Display'] text-[var(--gold)] lg:flex-1 text-center lg:text-left">
          Divine Gems
        </Link>

        {/* Menu Items: Center on lg+, Hidden on mobile */}
        {/* <ul className="hidden lg:flex flex-1 justify-center space-x-6">
          <li><Link href="/gemstones" className="hover:text-[var(--saffron)]">Gemstones</Link></li>
          <li><Link href="/malas" className="hover:text-[var(--saffron)]">Malas</Link></li>
          <li><Link href="/bracelets" className="hover:text-[var(--saffron)]">Bracelets</Link></li>
          <li><Link href="/rudraksha" className="hover:text-[var(--saffron)]">Rudraksha</Link></li>
        </ul> */}
        <div className='hidden md:block'>

        {/* <NavItems/> */}
        </div>
      </div>

      {/* Sidebar for Mobile */}
      <div className={cn(isSidebarOpen ? 'bg-black block opacity-50 ease-in-out duration-700 transition-all absolute w-full h-full top-0 left-0 z-20': 'hidden')}/>
      <div ref={sidebarRef} className={`sidebar z-30 ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-['Playfair_Display'] text-[var(--gold)]">Menu</h2>
          <button onClick={toggleSidebar} aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* <NavItems className='flex'/> */}
        <ul className="flex flex-col space-y-4 p-4">
          <li><Link href="/gemstones" className="hover:text-[var(--saffron)]" onClick={toggleSidebar}>Gemstones</Link></li>
          <li><Link href="/malas" className="hover:text-[var(--saffron)]" onClick={toggleSidebar}>Malas</Link></li>
          <li><Link href="/bracelets" className="hover:text-[var(--saffron)]" onClick={toggleSidebar}>Bracelets</Link></li>
          <li><Link href="/rudraksha" className="hover:text-[var(--saffron)]" onClick={toggleSidebar}>Rudraksha</Link></li>
          <li>
            {isSignedIn ? (
            <UserButton/>
          ) : (
            <SignInButton mode="modal">
              <button className="clerk-button">Sign In</button>
            </SignInButton>
          )}
          </li>
        </ul>
        <div className="absolute bottom-4 left-4 flex space-x-4">
          <Link href="https://facebook.com" className="social-icon" aria-label="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </Link>
          <Link href="https://instagram.com" className="social-icon" aria-label="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </Link>
          <Link href="https://twitter.com" className="social-icon" aria-label="Twitter">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}