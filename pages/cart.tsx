// pages/cart.tsx

import { useCart, CartItem } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import FreeShippingProgressBar from '../components/FreeShippingProgressBar';
// import toast from 'react-hot-toast'; // REMOVED
// import UndoToast from '../components/UndoToast'; // REMOVED

export default function CartPage() {
  const { state, dispatch } = useCart();

  const handleRemoveItem = (id: string) => {
    const itemToRemove = state.items.find(item => item.id === id);
    if (!itemToRemove) return;

    dispatch({ type: 'REMOVE_ITEM', payload: { id } });

    // The toast.custom() call has been removed from here.
  };
  
  const handleQuantityChange = (id: string, newQuantity: number) => { /* ... */ };
  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const handleCheckout = () => { /* ... */ };

  // ... the rest of the component's JSX remains the same
  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* ... */}
      {state.items.length === 0 ? (
        <div /* ... Empty Cart ... */ ></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} /* ... */ >
                  {/* ... */}
                  <div className="flex flex-col items-center justify-between gap-4 sm:gap-2 mx-auto sm:mx-0">
                    {/* ... Quantity Buttons ... */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:underline text-xs"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div /* ... Order Summary ... */ ></div>
        </div>
      )}
    </div>
  );
}