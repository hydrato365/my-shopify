// pages/api/products.ts

import { shopifyFetch } from '../../lib/shopify';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest, // request ကို မသုံးတဲ့အတွက် underscore (_) ထည့်ထားပါတယ်
  res: NextApiResponse
) {
  // Shopify ကနေ product အားလုံးကို fetch လုပ်မယ့် query
  // Portfolio အတွက် default limit 250 က လုံလောက်ပါတယ်
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
    const products = data.products.edges.map((edge: { node: any }) => edge.node);
    
    // Product list အပြည့်အစုံကို ပြန်ပေးပါ
    res.status(200).json({ products });
  } catch (error) {
    console.error("Shopify get all products API error:", error);
    res.status(500).json({ message: "Error fetching all products." });
  }
}