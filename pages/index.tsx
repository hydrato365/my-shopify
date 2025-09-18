// pages/index.tsx

import { getPlaiceholder } from 'plaiceholder';
import { shopifyFetch } from '../lib/shopify';
import type { InferGetStaticPropsType } from 'next';
import { useState } from 'react';
import QuickViewModal from '../components/QuickViewModal';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero'; // Import the new Hero component

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

export default function Home({ products }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const handleQuickView = (product: Product) => { setQuickViewProduct(product); };
  const closeQuickView = () => { setQuickViewProduct(null); };

  return (
    <>
      {/* The new Hero component is added here */}
      <Hero />

      <div className="bg-soft-white dark:bg-soft-black">
        {/* The id="latest-products" is added here to mark the scroll trigger point */}
        <div id="latest-products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-text-light sm:text-3xl text-center mb-12">
            Our Latest Products
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 xl:gap-x-8">
              {products.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 dark:text-text-light">No Products Found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Please check back later for new arrivals!</p>
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          productHandle={quickViewProduct.handle}
          onClose={closeQuickView}
        />
      )}
    </>
  );
}

export async function getStaticProps() {
  const productsQuery = `
    query GetProducts {
      products(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            totalInventory
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
            variants(first: 5) { edges { node { id title } } }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(productsQuery);

  if (!data || !data.products) {
    return {
      props: { products: [] },
      revalidate: 60
    };
  }

  const rawProducts = data.products.edges.map((edge: { node: Product }) => edge.node);

  const productsWithBlur = await Promise.all(
    rawProducts.map(async (product: Product) => {
      if (product.featuredImage && product.featuredImage.url) {
        try {
          const response = await fetch(product.featuredImage.url);
          if (!response.ok) throw new Error('Image fetch failed');
          const buffer = Buffer.from(await response.arrayBuffer());
          const { base64 } = await getPlaiceholder(buffer);
          return { ...product, blurDataURL: base64 };
        } catch (e) {
          console.error(`Plaiceholder error for ${product.title}:`, e);
          return product;
        }
      }
      return product;
    })
  );

  return {
    props: {
      products: productsWithBlur
    },
    revalidate: 60
  };
}