// pages/api/products.ts

import { shopifyFetch } from '../../lib/shopify';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define a specific type for the product data coming from Shopify
type ProductNode = {
  id: string;
  handle: string;
  title: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

// Define the type for the "edge" which contains the node
type ProductEdge = {
  node: ProductNode;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const allProductsQuery = `
    query getAllProducts {
      products(first: 250) {
        edges {
          node {
            id
            handle
            title
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(allProductsQuery);
    
    // Use the specific 'ProductEdge' type instead of '{ node: any }'
    const products = data.products.edges.map((edge: ProductEdge) => edge.node);
    
    res.status(200).json({ products });
  } catch (error) {
    console.error("Shopify get all products API error:", error);
    res.status(500).json({ message: "Error fetching all products." });
  }
}