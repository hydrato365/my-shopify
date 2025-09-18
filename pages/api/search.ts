// pages/api/search.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { searchProducts } from '../../lib/shopify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { term, sortKey, reverse } = req.query;

  if (typeof term !== 'string') {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const products = await searchProducts({
      term,
      sortKey: typeof sortKey === 'string' ? sortKey : 'RELEVANCE',
      reverse: reverse === 'true',
    });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search products' });
  }
}