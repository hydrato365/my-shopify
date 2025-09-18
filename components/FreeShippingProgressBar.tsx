// components/FreeShippingProgressBar.tsx

import React from 'react';

// Free shipping ရဖို့ လိုအပ်တဲ့ ပမာဏကို ဒီမှာ သတ်မှတ်ပါ
const SHIPPING_THRESHOLD = 50;

type Props = {
  currentSubtotal: number;
};

export default function FreeShippingProgressBar({ currentSubtotal }: Props) {
  // Free shipping ရဖို့ ဘယ်လောက်လိုသေးလဲ တွက်ချက်ပါ
  const remainingAmount = SHIPPING_THRESHOLD - currentSubtotal;
  
  // Progress bar အတွက် ရာခိုင်နှုန်းကို တွက်ချက်ပါ (100% ထက်မကျော်အောင်)
  const progressPercentage = Math.min((currentSubtotal / SHIPPING_THRESHOLD) * 100, 100);

  // Subtotal က $0 ဖြစ်နေရင် ဘာမှမပြပါ
  if (currentSubtotal <= 0) {
    return null;
  }

  return (
    <div className="text-center w-full mb-4">
      {remainingAmount > 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          You are <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(remainingAmount)}</span> away from free shipping!
        </p>
      ) : (
        <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">
          {/* FIX: Replaced the apostrophe with its HTML entity equivalent */}
          Congratulations! You&rsquo;ve got free shipping!
        </p>
      )}

      {/* Progress Bar UI */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}