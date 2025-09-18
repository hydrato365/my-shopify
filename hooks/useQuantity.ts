// hooks/useQuantity.ts

import { useState, useCallback, useEffect } from 'react';

export const useQuantity = (initialQuantity: number = 1, maxQuantity?: number) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // When maxQuantity changes (e.g., user selects a new variant),
  // ensure the current quantity is not more than the available stock.
  useEffect(() => {
    if (maxQuantity !== undefined && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity));
    }
  }, [maxQuantity, quantity]);

  const increment = useCallback(() => {
    setQuantity(q => {
      const newQuantity = q + 1;
      // If there's a max limit, don't exceed it. Otherwise, just increment.
      return maxQuantity !== undefined ? Math.min(newQuantity, maxQuantity) : newQuantity;
    });
  }, [maxQuantity]);

  const decrement = useCallback(() => {
    setQuantity(q => Math.max(1, q - 1));
  }, []);
  
  const resetQuantity = useCallback(() => {
    setQuantity(1);
  }, []);

  return {
    quantity,
    setQuantity,
    increment,
    decrement,
    resetQuantity
  };
};