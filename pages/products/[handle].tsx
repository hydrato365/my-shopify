// pages/products/[handle].tsx

import { getPlaiceholder } from "plaiceholder";
import { shopifyFetch, getProductByHandle, ShopifyProduct } from "../../lib/shopify";
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, CartItem } from "../../context/CartContext";
import { useProductOptions, ProductWithVariants } from "../../hooks/useProductOptions";
import { useQuantity } from "../../hooks/useQuantity";
import { useState, useEffect } from "react";

type ProductImage = {
  url: string;
  altText: string | null;
};

type ImageEdge = {
  node: ProductImage;
};

type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

function ChevronDown() { return ( <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> </svg> ); }

function StockInfo({ variant }: { variant: { availableForSale: boolean, quantityAvailable: number } | null | undefined }) {
  if (!variant) return null;
  if (!variant.availableForSale) {
    return <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-500">Out of Stock</p>;
  }
  return <p className="mt-2 text-sm font-semibold text-green-600 dark:text-green-500">{variant.quantityAvailable} in stock</p>;
}

function RecommendationSection({ products }: { products: ShopifyProduct[] }) {
    if (products.length === 0) return null; 
    return ( 
        <div className="bg-gray-50 dark:bg-black py-16"> 
            <div className="container mx-auto px-4"> 
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">You Might Also Like</h2> 
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> 
                    {products.map(product => ( 
                        <Link key={product.id} href={`/products/${product.handle}`} className="group"> 
                            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-shadow"> 
                                <div className="relative aspect-square w-full"> 
                                    <Image src={product.featuredImage?.url || '/placeholder.png'} alt={product.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform" placeholder={product.blurDataURL ? "blur" : "empty"} blurDataURL={product.blurDataURL} />
                                    {!product.availableForSale && (
                                        <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">Sold Out</div>
                                    )}
                                </div> 
                                <div className="p-4"> 
                                    <h3 className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{product.title}</h3> 
                                    <p className="text-sm mt-1 text-gray-900 dark:text-white"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.priceRange.minVariantPrice.currencyCode }).format(parseFloat(product.priceRange.minVariantPrice.amount))} </p> 
                                </div> 
                            </div> 
                        </Link> 
                    ))} 
                </div> 
            </div> 
        </div> 
    ); 
}

export default function ProductPage({ product, recommendations }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { addItem } = useCart();
  const { selectedOptions, selectedVariant, handleOptionChange, isOptionAvailable } = useProductOptions(product as ProductWithVariants);
  const { quantity, increment, decrement, resetQuantity } = useQuantity(1, selectedVariant?.quantityAvailable);
  const [activeImage, setActiveImage] = useState(product?.featuredImage?.url || '');

  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setActiveImage(selectedVariant.image.url);
    } else if (product?.featuredImage?.url) {
      setActiveImage(product.featuredImage.url);
    }
    resetQuantity();
  }, [selectedVariant, product, resetQuantity]);

  const handleAddToCart = () => {
    if (!selectedVariant || !product || !selectedVariant.availableForSale) return;
    const cartItem: CartItem = { id: selectedVariant.id, title: product.title, variantTitle: selectedVariant.title !== 'Default Title' ? selectedVariant.title : '', image: selectedVariant.image?.url || product.featuredImage?.url || '/placeholder.png', price: parseFloat(selectedVariant.price.amount), quantity: quantity, };
    addItem(cartItem);
  };

  if (!product) {
    return <div className="text-center py-20 text-gray-800 dark:text-gray-200">Product not found.</div>;
  }
  
  const allImages = product.images?.edges.map((edge: ImageEdge) => edge.node) ?? [];

  return (
    <>
      <div className="bg-white dark:bg-gray-950">
        <div className="container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div>
              <div className="relative w-full aspect-square rounded-lg shadow-lg overflow-hidden bg-white mb-4">
                <Image key={activeImage} src={activeImage} alt={product.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-full object-contain transition-opacity duration-300" />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((image: ProductImage, index: number) => (
                    <button key={index} onClick={() => setActiveImage(image.url)} className={`relative aspect-square rounded-md overflow-hidden transition-all duration-200 ring-2 focus:outline-none focus:ring-blue-500 ${activeImage === image.url ? 'ring-blue-500' : 'ring-transparent hover:ring-blue-300'}`}>
                      <Image src={image.url} alt={image.altText || `Thumbnail ${index + 1}`} fill sizes="10vw" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col mt-6 md:mt-0">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{product.title}</h1>
                <div className="flex items-baseline gap-2">
                  <p className="mt-2 text-2xl text-gray-800 dark:text-gray-200">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode, }).format(parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount))}
                  </p>
                  <StockInfo variant={selectedVariant} />
                </div>
                <div className="mt-6 space-y-4">
                  {product.options?.map((option: ProductOption) => (
                    option.values.length > 1 && ( <div key={option.id}> <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">{option.name}</h3> <div className="flex flex-wrap gap-2 mt-2"> {option.values.map((value) => { const isSelected = selectedOptions[option.name] === value; const isAvailable = isOptionAvailable(option.name, value); return ( <button key={value} onClick={() => handleOptionChange(option.name, value)} disabled={!isAvailable} className={` relative px-4 py-2 text-sm border rounded-full transition-colors duration-200 ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700'} ${isAvailable ? 'hover:border-black dark:hover:border-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`} > {value} {!isAvailable && ( <span className="absolute inset-0 flex items-center justify-center"> <span className="w-full h-0.5 bg-gray-400 dark:bg-gray-600 transform rotate-[-20deg] scale-x-110"></span> </span> )} </button> ); })} </div> </div> )
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full">
                    <button onClick={decrement} className="px-4 py-2 text-lg dark:text-white">-</button>
                    <span className="w-10 text-center px-4 py-2 text-lg font-medium dark:text-white">{quantity}</span>
                    <button onClick={increment} disabled={!selectedVariant || quantity >= selectedVariant.quantityAvailable} className="px-4 py-2 text-lg dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                  </div>
                  <button onClick={handleAddToCart} disabled={!selectedVariant || !selectedVariant.availableForSale} className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {!selectedVariant ? 'Unavailable' : selectedVariant.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
                <div className="mt-10 space-y-4">
                  <details className="group border-b border-gray-200 dark:border-gray-800 pb-4" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900 dark:text-white">Product Details<ChevronDown /></summary>
                    <div className="mt-4 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                  </details>
                  <details className="group border-b border-gray-200 dark:border-gray-800 pb-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900 dark:text-white">Shipping & Returns<ChevronDown /></summary>
                    <div className="mt-4 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                      <p>Free standard shipping on orders over $50. Returns are accepted within 30 days of purchase. Please see our full policy for more details.</p>
                    </div>
                  </details>
                </div>
            </div>
          </div>
        </div>
      </div>
      <RecommendationSection products={recommendations} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const productPathsQuery = `query Products { products(first: 250) { edges { node { handle } } } }`;
  const data = await shopifyFetch<{ products: { edges: { node: { handle: string } }[] } }>(productPathsQuery);
  if (!data?.products) { return { paths: [], fallback: 'blocking', }; }
  const paths = data.products.edges.map(({ node }) => ({ params: { handle: node.handle }, }));
  return { paths, fallback: 'blocking', };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const handle = params?.handle as string;
  const { product, recommendations } = await getProductByHandle(handle);
  if (!product) { return { notFound: true }; }
  
  const recommendationsWithBlur = await Promise.all(
    (recommendations || []).map(async (p: ShopifyProduct) => {
      if (p.featuredImage?.url) {
        try {
          const imageResponse = await fetch(p.featuredImage.url);
          if (!imageResponse.ok) throw new Error('Image fetch failed for recommendation');
          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          const { base64 } = await getPlaiceholder(buffer);
          return { ...p, blurDataURL: base64 };
        } catch (e) { 
          console.error("Plaiceholder error for recommendation:", e);
          return p; 
        }
      }
      return p;
    })
  );
  
  // FIX: Change 'let' to 'const'
  const mainProductWithBlur = { ...product };
  if (mainProductWithBlur.featuredImage?.url) {
    try {
      const imageResponse = await fetch(mainProductWithBlur.featuredImage.url);
      if (!imageResponse.ok) throw new Error('Image fetch failed for main product');
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      const { base64 } = await getPlaiceholder(buffer);
      mainProductWithBlur.blurDataURL = base64;
    } catch (e) {
      console.error("Plaiceholder error for main product:", e);
    }
  }

  return { 
    props: { 
      product: mainProductWithBlur, 
      recommendations: recommendationsWithBlur 
    }, 
    revalidate: 60 
  };
};