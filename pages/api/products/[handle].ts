// pages/api/products/[handle].ts

import { shopifyFetch } from '../../../lib/shopify';
import type { NextApiRequest, NextApiResponse } from 'next';

// --- TYPE DEFINITIONS START ---
// Define the shape of a single product as returned by the GraphQL query
// This can be expanded if more fields are needed in the future.
type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  // ... add other fields from the query if needed
};

// Define the expected shape of the entire API response from shopifyFetch
type ShopifyProductResponse = {
  product: ShopifyProduct | null; // The product can be null if not found
};
// --- TYPE DEFINITIONS END ---

const productByHandleQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
      options { id name values }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            image { url altText }
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const handle = req.query.handle as string;

  if (!handle) {
    return res.status(400).json({ message: 'Product handle is required.' });
  }

  try {
    // --- FIX START ---
    // Tell shopifyFetch what type of data to expect
    const data = await shopifyFetch<ShopifyProductResponse>(productByHandleQuery, { handle });

    // Add a more robust check for data and data.product
    if (!data?.product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    // --- FIX END ---
    
    // Now TypeScript knows the shape of 'data', so this is safe
    res.status(200).json({ product: data.product });
  } catch (error) {
    console.error("API error fetching product by handle:", error);
    res.status(500).json({ message: "Error fetching product details." });
  }
}