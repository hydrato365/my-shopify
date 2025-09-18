// components/DesktopSearch.tsx

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// --- Product Type Definition ---
type ProductResult = {
  id: string;
  title: string;
  handle: string;
  featuredImage: { url: string; altText: string | null; } | null;
};

// --- SVG Icons (No changes here) ---
function SearchIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>); }
function SpinnerIcon() { return (<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}
function XIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>); }


export default function DesktopSearch() {
  const [isActive, setIsActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- အပြောင်းအလဲများ စတင်သည် ---
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  // --- အပြောင်းအလဲများ ပြီးဆုံးသည် ---


  // --- Debounce Logic နှင့် API Call ---
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
                setResults(data.products.slice(0, 5)); // Show top 5 results
            }
        })
        .catch(err => console.error("Search API failed:", err))
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleResultClick = () => {
    setIsActive(false);
    setSearchTerm('');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onFocus={() => setIsActive(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full h-10 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all duration-300 ease-in-out ${isActive ? 'w-64' : 'w-48'}`}
        />
        <span className="absolute left-3 text-gray-400">
          {loading ? <SpinnerIcon /> : <SearchIcon />}
        </span>
        {isActive && searchTerm && !loading && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 text-gray-500 hover:text-gray-800" aria-label="Clear search">
            <XIcon />
          </button>
        )}
      </div>

      {isActive && searchTerm && (
        <div className="absolute top-full mt-2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-10">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((product) => (
                  <li key={product.id}>
                    <Link href={`/products/${product.handle}`} onClick={handleResultClick} className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Image src={product.featuredImage?.url || '/placeholder.png'} alt={product.title} width={50} height={50} className="object-contain rounded" />
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{product.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href={`/search?q=${searchTerm}`} 
                onClick={handleResultClick}
                className="block w-full text-center p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                View all results
              </Link>
            </>
          ) : (
            !loading && <p className="p-4 text-center text-gray-500">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}