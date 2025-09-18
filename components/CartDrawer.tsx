// components/CartDrawer.tsx

import { useCart } from '../context/CartContext';
import Image from 'next/image';
import FreeShippingProgressBar from './FreeShippingProgressBar';

// --- SVG Icons (No Changes) ---
function ArrowLeftIcon() { return ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /> </svg> ); }
function ShoppingBagIcon() { return ( <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> </svg> ) }

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutClick: () => void; // <-- ပြင်ဆင်ချက်
};

export default function CartDrawer({ isOpen, onClose, onCheckoutClick }: CartDrawerProps) { // <-- ပြင်ဆင်ချက်
  // Use the new functions from the cart context
  const { state, removeItem, updateQuantity } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    // The logic in the context will handle removal if quantity is 0 or less
    updateQuantity(id, newQuantity);
  };
  
  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 dark:hover:text-white" aria-label="Close cart">
              <ArrowLeftIcon />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">Shopping Cart</h2>
          </div>

          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow p-4 text-center">
              <ShoppingBagIcon />
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Your cart is empty</p>
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-white dark:bg-gray-800">
                    <Image src={item.image || '/placeholder.png'} alt={item.title} fill sizes="80px" className="object-contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</h3>
                    {item.variantTitle && <p className="text-sm text-gray-500 dark:text-gray-400">{item.variantTitle}</p>}
                    <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">-</button>
                        <span className="w-8 text-center text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:underline text-xs font-medium">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <FreeShippingProgressBar currentSubtotal={subtotal} />
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout.</p>
              <button 
                onClick={onCheckoutClick} // <-- ပြင်ဆင်ချက်
                className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}