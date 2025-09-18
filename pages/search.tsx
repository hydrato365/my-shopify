// pages/search.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductFilters from '../components/ProductFilters';
import QuickViewModal from '../components/QuickViewModal';
import { ShopifyProduct } from '../lib/shopify'; // Import the strong type

export default function SearchPage() {
  const router = useRouter();
  // Use the imported ShopifyProduct type
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOptions, setSortOptions] = useState({ sortKey: 'RELEVANCE', reverse: false });
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  const searchTerm = router.query.q;

  useEffect(() => {
    if (typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      setLoading(true);
      const { sortKey, reverse } = sortOptions;
      
      fetch(`/api/search?term=${encodeURIComponent(searchTerm)}&sortKey=${sortKey}&reverse=${reverse}`)
        .then(res => res.json())
        .then(data => {
          if (data.products && Array.isArray(data.products)) {
             Promise.all(
                // Assert the type here as well
                (data.products as ShopifyProduct[]).map(async (p: ShopifyProduct) => {
                  if (p.featuredImage) {
                    try {
                      const res = await fetch(`/api/plaiceholder?imageUrl=${encodeURIComponent(p.featuredImage.url)}`);
                      if (!res.ok) throw new Error('Plaiceholder fetch failed');
                      const { base64 } = await res.json();
                      return { ...p, blurDataURL: base64 };
                    } catch (e) { return p; }
                  }
                  return p;
                })
             ).then(productsWithBlur => {
                setResults(productsWithBlur);
                setLoading(false);
             });
          } else {
             setResults([]);
             setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          setResults([]);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [searchTerm, sortOptions]);

  const handleFilterChange = (sortKey: string, reverse: boolean) => {
    setSortOptions({ sortKey, reverse });
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {/* FIX: Escape double quotes */}
              {searchTerm ? `Results for "${searchTerm}"` : 'Search'}
            </h1>
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
            ) : results.length > 0 ? (
              results.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">No products found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Try a different search term or check out our new arrivals.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {quickViewProduct && (
        <QuickViewModal 
          productHandle={quickViewProduct.handle} 
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}