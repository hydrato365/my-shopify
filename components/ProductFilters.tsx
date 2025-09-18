// components/ProductFilters.tsx

import { useState, ChangeEvent } from 'react';

type ProductFiltersProps = {
  onFilterChange: (sortKey: string, reverse: boolean) => void;
};

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [sortOption, setSortOption] = useState('RELEVANCE-false');

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortOption(value);
    const [sortKey, reverseStr] = value.split('-');
    const reverse = reverseStr === 'true';
    onFilterChange(sortKey, reverse);
  };

  return (
    <div className="flex items-center gap-2 mt-4 sm:mt-0">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
      <select
        id="sort"
        name="sort"
        value={sortOption}
        onChange={handleSortChange}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="RELEVANCE-false">Relevance</option>
        <option value="CREATED_AT-true">Newest</option>
        <option value="PRICE-false">Price: Low to High</option>
        <option value="PRICE-true">Price: High to Low</option>
        <option value="TITLE-false">Alphabetically, A-Z</option>
        <option value="TITLE-true">Alphabetically, Z-A</option>
      </select>
    </div>
  );
}