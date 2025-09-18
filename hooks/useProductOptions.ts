// hooks/useProductOptions.ts

import { useState, useMemo, useEffect, useCallback } from 'react';

type ProductOption = { id: string; name: string; values: string[]; };
type SelectedOption = { name: string; value: string; };
type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number; // <-- NEW
  image?: { url: string; altText: string; };
  price: { amount: string; currencyCode: string; };
  selectedOptions: SelectedOption[];
};
export type ProductWithVariants = {
  options: ProductOption[];
  variants: { edges: { node: ProductVariant }[] };
} | null;


export const useProductOptions = (product: ProductWithVariants) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaultOptions: Record<string, string> = {};
    product?.options?.forEach((option: ProductOption) => {
      if (option.name && option.values[0]) {
        defaultOptions[option.name] = option.values[0];
      }
    });
    setSelectedOptions(defaultOptions);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.edges.find(({ node }) => 
      node.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
    )?.node;
  }, [selectedOptions, product]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };
  
  const isOptionAvailable = useCallback((optionName: string, value: string) => {
    if (!product) return false;
    const otherSelectedOptions = Object.entries(selectedOptions).filter(([key]) => key !== optionName);
    const hasAvailableVariant = product.variants.edges.some(({ node }) => {
      const isValueMatch = node.selectedOptions.some(opt => opt.name === optionName && opt.value === value);
      if (!isValueMatch) return false;
      const areOthersMatched = otherSelectedOptions.every(([otherKey, otherValue]) => 
        node.selectedOptions.some(opt => opt.name === otherKey && opt.value === otherValue)
      );
      return areOthersMatched && node.availableForSale;
    });
    return hasAvailableVariant;
  }, [product, selectedOptions]);

  return {
    selectedOptions,
    selectedVariant,
    handleOptionChange,
    isOptionAvailable,
  };
};