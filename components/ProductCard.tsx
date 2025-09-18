// components/ProductCard.tsx

import Link from 'next/link';
import Image from 'next/image';
import { useCart, CartItem } from '../context/CartContext';
import React, { Dispatch, SetStateAction } from 'react'; // Import Dispatch and SetStateAction
import { ShopifyProduct } from '../lib/shopify'; // Import ShopifyProduct

function CartPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

type ProductCardProps = {
  product: ShopifyProduct;
  // FIX: Update the type of onQuickView
  onQuickView: Dispatch<SetStateAction<ShopifyProduct | null>>;
};

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();

  const variants = product.variants?.edges ?? [];
  const hasVariants = variants.length > 1 || 
                      (variants.length === 1 && variants[0].node.title !== 'Default Title');
  
  const handleDirectAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants || variants.length === 0 || !product.availableForSale) return;
    
    const defaultVariant = variants[0].node;
    const itemToAdd: CartItem = {
      id: defaultVariant.id,
      title: product.title,
      variantTitle: '',
      image: product.featuredImage?.url || '/placeholder.png',
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      quantity: 1,
    };
    addItem(itemToAdd);
  };

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      onQuickView(product);
    } else {
      handleDirectAddToCart(e);
    }
    e.currentTarget.blur();
  };

  const isSoldOut = !product.availableForSale;

  return (
    <div className="group relative flex flex-col">
      <Link 
        href={`/products/${product.handle}`} 
        className={`flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${isSoldOut ? '' : 'can-hover:hover:shadow-lg can-hover:hover:-translate-y-1'}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-white dark:bg-gray-900">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain object-center transition-transform duration-300 p-4 ${isSoldOut ? 'opacity-70' : 'can-hover:group-hover:scale-105'}`}
              placeholder={product.blurDataURL ? "blur" : "empty"}
              blurDataURL={product.blurDataURL}
            />
          ) : (<div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800"><span className="text-xs text-gray-500">No Image</span></div>)}
          
          {isSoldOut && (
            <div className="absolute top-3 left-3 bg-gray-900 bg-opacity-80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Sold Out</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">{product.title}</h3>
          
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.priceRange.minVariantPrice.currencyCode }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
            </p>
            
            <button 
              onClick={handleIconClick}
              disabled={isSoldOut && !hasVariants}
              aria-label={hasVariants ? `View options for ${product.title}` : `Add ${product.title} to cart`}
              className={`
                p-2 rounded-full text-gray-600 dark:text-gray-300 
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSoldOut && !hasVariants 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'can-hover:hover:bg-gray-100 dark:can-hover:hover:bg-gray-700 opacity-100 md:opacity-0 md:can-hover:group-hover:opacity-100'
                }
              `}
            >
              <CartPlusIcon />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}