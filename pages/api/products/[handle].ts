// pages/api/products/[handle].ts

import { shopifyFetch } from '../../../lib/shopify';
import type { NextApiRequest, NextApiResponse } from 'next';

const productByHandleQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
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
      options {
        id
        name
        values
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
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
    const data = await shopifyFetch(productByHandleQuery, { handle });
    if (!data.product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ product: data.product });
  } catch (error) {
    console.error("API error fetching product by handle:", error);
    res.status(500).json({ message: "Error fetching product details." });
  }
}