// pages/products.tsx

import { useState, useCallback } from 'react';
import type { InferGetStaticPropsType } from 'next';
import { getPlaiceholder } from 'plaiceholder';
import { getAllProducts } from '../lib/shopify';
import ProductFilters from '../components/ProductFilters';
import QuickViewModal from '../components/QuickViewModal';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useCart, CartItem } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

type ProductVariant = { node: { id: string; title: string; } };

type Product = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  totalInventory: number;
  featuredImage: { url: string; altText: string | null; } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string; }; };
  variants?: { edges: ProductVariant[] };
  blurDataURL?: string;
};

export default function ProductsPage({ initialProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addItem } = useCart();
  const handleAddToCart = (item: CartItem) => {
    addItem(item);
  };

  const handleFilterChange = useCallback(async (sortKey: string, reverse: boolean) => {
    setLoading(true);
    try {
      const fetchedProducts = await getAllProducts({ sortKey, reverse });
      const productsWithBlur = await Promise.all(
        (fetchedProducts as Product[]).map(async (p: Product) => {
          if (p.featuredImage && !p.blurDataURL) {
            try {
              // Note: Using the API route for client-side fetching
              const res = await fetch(`/api/plaiceholder?imageUrl=${encodeURIComponent(p.featuredImage.url)}`);
              if (!res.ok) throw new Error('Failed to fetch plaiceholder');
              const { base64 } = await res.json();
              return { ...p, blurDataURL: base64 };
            } catch (e) {
              console.error("Client-side plaiceholder fetch failed:", e);
              return p;
            }
          }
          return p;
        })
      );
      setProducts(productsWithBlur);
    } catch (error) {
      console.error("Failed to fetch filtered products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <div className="bg-gray-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">All Products</h1>
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
          <div className="relative">
            <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8 transition-opacity duration-300 ease-in-out ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
            {loading && (
              <div className="absolute inset-0 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8">
                {Array.from({ length: products.length > 0 ? products.length : 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
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

// --- GETSTATICPROPS FIX START ---
export async function getStaticProps() {
  const initialProducts = await getAllProducts({});
  if (!initialProducts) {
    return {
      props: { initialProducts: [] },
      revalidate: 60
    };
  }

  const productsWithBlur = await Promise.all(
    (initialProducts as Product[]).map(async (product: Product) => {
      if (product.featuredImage) {
        try {
          // 1. Fetch the image URL to get the raw image data
          const imageResponse = await fetch(product.featuredImage.url);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
          }
          
          // 2. Convert the image data into a Buffer
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

          // 3. Pass the Buffer to getPlaiceholder
          const { base64 } = await getPlaiceholder(imageBuffer);

          return { ...product, blurDataURL: base64 };
        } catch (e) {
          // If fetching or plaiceholder fails, log the error and continue
          console.error(`Failed to generate plaiceholder for ${product.title}:`, e);
          return product;
        }
      }
      return product;
    })
  );
  return {
    props: {
      initialProducts: productsWithBlur
    },
    revalidate: 60
  };
}
// --- GETSTATICPROPS FIX END ---