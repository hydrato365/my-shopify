// components/LiveSearch.tsx

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type ProductResult = {
  id: string;
  title: string;
  handle: string;
  featuredImage: { url: string; altText: string | null; } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string; }; };
};

function SearchIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>); }
function SpinnerIcon() { return (<svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}
function XIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>); }


export default function LiveSearch({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const debounceTimer = setTimeout(() => {
      fetch(`/api/search?term=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
            if (data.products) {
                setResults(data.products.slice(0, 5));
            }
        })
        .catch(err => console.error("Search API failed:", err))
        .finally(() => {
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[100]" onClick={onClose}>
      <div 
        ref={searchRef} 
        onClick={(e) => e.stopPropagation()} 
        className="relative mx-auto mt-16 max-w-xl w-full"
      >
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for snowboards, apparel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchTerm && <button onClick={handleClearSearch} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" aria-label="Clear search"><XIcon /></button>}
            {loading && <SpinnerIcon />}
          </div>
        </div>
        
        {searchTerm && results.length > 0 && (
           <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <ul>
                {results.map((product) => (
                    <li key={product.id}>
                    <Link href={`/products/${product.handle}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-md overflow-hidden">
                          <Image src={product.featuredImage?.url || '/placeholder.png'} alt={product.title} fill className="object-contain" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{product.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.priceRange.minVariantPrice.currencyCode }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
                          </p>
                        </div>
                    </Link>
                    </li>
                ))}
            </ul>
            <Link 
              href={`/search?q=${searchTerm}`} 
              onClick={onClose}
              className="block w-full text-center p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium text-blue-600 dark:text-blue-400 border-t dark:border-gray-600"
            >
              View all results
            </Link>
          </div>
        )}
        {searchTerm && results.length === 0 && !loading && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                {/* FIX: Replaced the double quotes with their HTML entity equivalent */}
                No products found for &quot;{searchTerm}&quot;.
            </div>
        )}
      </div>
    </div>
  );
}