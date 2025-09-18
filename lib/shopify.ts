// lib/shopify.ts

// --- TYPE DEFINITIONS for SHOPIFY API RESPONSES ---

// A generic type for Shopify's edge structure
type Edge<T> = {
  node: T;
};

// Type for a simple product variant (used in listings)
type SimpleProductVariant = {
  id: string;
  title: string;
};

// A comprehensive type for a Shopify Product
type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  totalInventory: number;
  descriptionHtml?: string; // Optional as it's not in all queries
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
  variants: {
    edges: Edge<SimpleProductVariant>[];
  };
  // Optional properties from the detailed product query
  images?: {
    edges: Edge<{ url: string; altText: string | null; }>[];
  };
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  collections?: {
    edges: Edge<{
      products: {
        edges: Edge<ShopifyProduct>[];
      };
    }>[];
  };
};

// --- ENVIRONMENT VARIABLES ---

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// --- CORE API FETCH FUNCTION ---

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | undefined> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error("Shopify environment variables are not set.");
  }
  try {
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN, },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });
    
    const jsonResponse = await response.json();
    
    if (jsonResponse.errors) {
      console.error("Shopify query errors:", jsonResponse.errors);
      throw new Error("Failed to fetch from Shopify");
    }
    
    return jsonResponse.data;
  } catch (error) {
    console.error("Error fetching from Shopify:", error);
    return undefined;
  }
}

// --- PRODUCT FETCHING FUNCTIONS ---

type ProductParams = { sortKey?: string; reverse?: boolean; };

export async function getAllProducts({ sortKey = 'RELEVANCE', reverse = false }: ProductParams) {
  const productsQuery = `
    query getProducts($sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: 20, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            totalInventory
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
            variants(first: 5) { edges { node { id title } } }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch<{ products: { edges: Edge<ShopifyProduct>[] } }>(productsQuery, { sortKey, reverse });
  if (!data?.products) return [];
  return data.products.edges.map((edge) => edge.node);
}

export async function getProductByHandle(handle: string) {
    const productByHandleQuery = `
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          descriptionHtml
          featuredImage { url altText }
          images(first: 10) { edges { node { url altText } } }
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
          collections(first: 1) {
            edges {
              node {
                products(first: 5, sortKey: RELEVANCE) {
                  edges {
                    node {
                      id
                      title
                      handle
                      availableForSale
                      totalInventory
                      featuredImage { url altText }
                      priceRange { minVariantPrice { amount currencyCode } }
                      variants(first: 1) { edges { node { id title } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await shopifyFetch<{ product: ShopifyProduct }>(productByHandleQuery, { handle });
    if (!data?.product) { return { product: null, recommendations: [] }; }
    
    const currentProductId = data.product.id;
    const recommendations = 
      data.product.collections?.edges[0]?.node.products.edges
        .map((edge) => edge.node)
        .filter((product) => product.id !== currentProductId)
        .slice(0, 4) ?? [];

    return { product: data.product, recommendations };
}

type SearchProductsParams = { term: string; sortKey?: string; reverse?: boolean; };
export async function searchProducts({ term, sortKey = 'RELEVANCE', reverse = false }: SearchProductsParams) {
  const searchQuery = `
    query searchProducts($query: String!, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: 20, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            totalInventory
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
          }
        }
      }
    }
  `;
  const queryString = `(title:${term}*) OR (tag:${term})`;
  const data = await shopifyFetch<{ products: { edges: Edge<ShopifyProduct>[] } }>(searchQuery, { query: queryString, sortKey, reverse });
  if (!data?.products) return [];
  return data.products.edges.map((edge) => edge.node);
}