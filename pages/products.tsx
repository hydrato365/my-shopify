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
  featuredImage: { url: string; altText: string | null; } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string; }; };
  variants?: { edges: ProductVariant[] };
  blurDataURL?: string;
};

export default function ProductsPage({ initialProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [products, setProducts] = useState<Product[]>(initialProducts); // CORRECTED THIS LINE
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { dispatch } = useCart();
  const handleAddToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const handleFilterChange = useCallback(async (sortKey: string, reverse: boolean) => {
    setLoading(true);
    try {
      const fetchedProducts = await getAllProducts({ sortKey, reverse });
      const productsWithBlur = await Promise.all(
        fetchedProducts.map(async (p: Product) => {
          if (p.featuredImage && !p.blurDataURL) {
            try {
              const res = await fetch(`/api/plaiceholder?imageUrl=${encodeURIComponent(p.featuredImage.url)}`);
              const { base64 } = await res.json();
              return { ...p, blurDataURL: base64 };
            } catch (e) {
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
            <div
              className={`
                grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                sm:gap-x-6 xl:gap-x-8 transition-opacity duration-300 ease-in-out
                ${loading ? 'opacity-50' : 'opacity-100'}
              `}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {loading && (
              <div
                className="
                  absolute inset-0 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2
                  lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8
                "
              >
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

export async function getStaticProps() {
  const initialProducts = await getAllProducts({});
  if (!initialProducts) {
    return {
      props: { initialProducts: [] },
      revalidate: 60
    };
  }

  const productsWithBlur = await Promise.all(
    initialProducts.map(async (product: Product) => {
      if (product.featuredImage) {
        try {
          const { base64 } = await getPlaiceholder(product.featuredImage.url);
          return { ...product, blurDataURL: base64 };
        } catch (e) {
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