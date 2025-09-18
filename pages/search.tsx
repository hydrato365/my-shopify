// pages/search.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductFilters from '../components/ProductFilters';
import QuickViewModal from '../components/QuickViewModal';

// Product Type ကို ဒီမှာ သတ်မှတ်ပါ
type Product = {
  id: string;
  title: string;
  handle: string;
  featuredImage: { url: string; altText: string | null; } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string; }; };
  blurDataURL?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOptions, setSortOptions] = useState({ sortKey: 'RELEVANCE', reverse: false });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // URL ကနေ search query 'q' ကို ဖတ်ယူပါ
  const searchTerm = router.query.q;

  useEffect(() => {
    // search term ရှိမှသာ API ကို fetch လုပ်ပါ
    if (typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      setLoading(true);
      const { sortKey, reverse } = sortOptions;
      
      // Server-side search API ကို ခေါ်ယူပါ
      fetch(`/api/search?term=${encodeURIComponent(searchTerm)}&sortKey=${sortKey}&reverse=${reverse}`)
        .then(res => res.json())
        .then(data => {
          // blurDataURL ကို client-side မှာ generate လုပ်ပါ
          if (data.products && Array.isArray(data.products)) {
             Promise.all(
                data.products.map(async (p: Product) => {
                  if (p.featuredImage) {
                    try {
                      const res = await fetch(`/api/plaiceholder?imageUrl=${encodeURIComponent(p.featuredImage.url)}`);
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
      // search term မရှိရင် ဘာမှမပြပါ
      setResults([]);
      setLoading(false);
    }
  }, [searchTerm, sortOptions]); // searchTerm သို့မဟုတ် sortOptions ပြောင်းလဲတိုင်း useEffect ကို ပြန် run ပါ

  const handleFilterChange = (sortKey: string, reverse: boolean) => {
    setSortOptions({ sortKey, reverse });
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {searchTerm ? `Results for "${searchTerm}"` : 'Search'}
            </h1>
            {/* Sorting component ကို ဒီမှာထည့်သုံးပါ */}
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8">
            {loading ? (
              // Loading ဖြစ်နေချိန်တွင် Skeleton UI ကို ပြပါ
              Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
            ) : results.length > 0 ? (
              // Results ရှိလျှင် Product Card များကို ပြပါ
              results.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))
            ) : (
              // Results မရှိလျှင် message ပြပါ
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