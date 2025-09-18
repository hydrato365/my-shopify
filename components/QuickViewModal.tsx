// components/QuickViewModal.tsx 

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart, CartItem } from '../context/CartContext';
import { useProductOptions, ProductWithVariants } from '../hooks/useProductOptions';
import { useQuantity } from '../hooks/useQuantity';

type Product = ProductWithVariants & {
  id: string;
  title: string;
  descriptionHtml: string;
  featuredImage: { url: string; altText: string; } | null;
};
function XIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>); } function SpinnerIcon() { return (<svg className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}

// ==================== MODIFICATION START ====================
function StockInfo({ variant }: { variant: { availableForSale: boolean, quantityAvailable: number } | null | undefined }) {
  if (!variant) return null;
  
  if (!variant.availableForSale) {
    return <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-500">Out of Stock</p>;
  }

  // Always show the exact quantity if it's greater than 0
  return <p className="mt-2 text-sm font-semibold text-green-600 dark:text-green-500">{variant.quantityAvailable} in stock</p>;
}
// ===================== MODIFICATION END =====================

export default function QuickViewModal({ productHandle, onClose }: { productHandle: string; onClose: () => void; }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { selectedOptions, selectedVariant, handleOptionChange } = useProductOptions(product);
  const { quantity, increment, decrement, resetQuantity } = useQuantity(1, selectedVariant?.quantityAvailable);

  useEffect(() => {
    resetQuantity();
  }, [selectedVariant, resetQuantity]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productHandle}`)
      .then(res => res.json())
      .then(data => { setProduct(data.product); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [productHandle]);
  
  const handleAddToCart = () => {
    if (!selectedVariant || !product || !selectedVariant.availableForSale) return;
    const cartItem: CartItem = { 
      id: selectedVariant.id, 
      title: product.title, 
      variantTitle: selectedVariant.title !== 'Default Title' ? selectedVariant.title : '', 
      image: selectedVariant.image?.url || product.featuredImage?.url || '/placeholder.png', 
      price: parseFloat(selectedVariant.price.amount), 
      quantity: quantity, 
    };
    addItem(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white z-10" aria-label="Close quick view"><XIcon /></button>
        {loading ? (
            <div className="flex justify-center items-center h-96"><SpinnerIcon /></div>
        ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square bg-white dark:bg-gray-700 rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                    <Image src={selectedVariant?.image?.url || product.featuredImage?.url || '/placeholder.png'} alt={product.title} fill className="object-contain p-4" />
                </div>
                <div className="p-6 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.title}</h2>
                    <div className="flex items-baseline gap-2">
                      <p className="mt-2 text-xl text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedVariant?.price.currencyCode || 'USD' }).format(parseFloat(selectedVariant?.price.amount || '0'))}</p>
                      <StockInfo variant={selectedVariant} />
                    </div>
                    <div className="mt-4 prose dark:prose-invert text-sm text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}/>
                    <div className="mt-auto pt-6 space-y-4">
                        {product.options.map(option => (
                            option.values.length > 1 && (
                                <div key={option.id}>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">{option.name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                    {option.values.map(value => (<button key={value} onClick={() => handleOptionChange(option.name, value)} className={`px-3 py-1 text-sm border rounded-full transition-colors ${selectedOptions[option.name] === value ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:border-black dark:hover:border-white'}`}>{value}</button>))}
                                    </div>
                                </div>
                            )
                        ))}
                         <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full">
                                <button onClick={decrement} className="px-4 py-2 text-lg text-gray-700 dark:text-gray-200">-</button>
                                <span className="w-10 text-center text-lg font-medium text-gray-900 dark:text-white">{quantity}</span>
                                <button onClick={increment} disabled={!selectedVariant || quantity >= selectedVariant.quantityAvailable} className="px-4 py-2 text-lg text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                            </div>
                            <button onClick={handleAddToCart} disabled={!selectedVariant || !selectedVariant.availableForSale} className="flex-1 w-full bg-blue-600 text-white font-semibold py-3 rounded-full shadow-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                              {!selectedVariant ? 'Select Options' : selectedVariant.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Could not load product details.</div>
        )}
      </div>
    </div>
  );
}