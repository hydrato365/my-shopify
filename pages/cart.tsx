// pages/cart.tsx

import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import FreeShippingProgressBar from '../components/FreeShippingProgressBar';

export default function CartPage() {
  // Change: Destructure 'removeItem' and 'updateQuantity' instead of 'dispatch'
  const { state, removeItem, updateQuantity } = useCart();

  // Change: Use the 'removeItem' function from the context directly
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };
  
  // Implemented handleQuantityChange using the function from the context
  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const handleCheckout = () => { 
    // Logic for checkout can be added here
    console.log('Redirecting to checkout...');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Cart</h1>
      <FreeShippingProgressBar subtotal={subtotal} />

      {state.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">Your cart is empty.</p>
          <Link href="/" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors">
              Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link href={`/products/${item.id.split('/').pop()}`} className="font-semibold hover:underline">
                        {item.title}
                    </Link>
                    {item.variantTitle && <p className="text-sm text-gray-500">{item.variantTitle}</p>}
                    <p className="text-gray-800 font-medium mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-4 h-full">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-lg"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-center w-12">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-lg"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
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
          <div className="lg:col-span-1">
             <div className="border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-3 rounded-md mt-6 hover:bg-gray-800 transition-colors"
                >
                    Proceed to Checkout
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}