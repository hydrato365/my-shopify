// lib/shopify.ts

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch(query: string, variables = {}) {
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
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(productsQuery, { sortKey, reverse });
  return data.products.edges.map((edge: { node: any }) => edge.node);
}

export async function getProductByHandle(handle: string) {
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
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
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
                      variants(first: 1) {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await shopifyFetch(productByHandleQuery, { handle });
    if (!data || !data.product) { return { product: null, recommendations: [] }; }
    const currentProductId = data.product.id;
    let recommendations = [];
    if (data.product.collections.edges[0]?.node.products.edges) { recommendations = data.product.collections.edges[0].node.products.edges.map((edge: { node: any }) => edge.node).filter((product: any) => product.id !== currentProductId); }
    return { product: data.product, recommendations: recommendations.slice(0, 4) };
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
  
  // ==================== MODIFICATION START ====================
  // This new query string searches the term in either the product's title OR its tags.
  const queryString = `(title:${term}*) OR (tag:${term})`;
  // ===================== MODIFICATION END =====================

  const data = await shopifyFetch(searchQuery, { query: queryString, sortKey, reverse });
  
  if (!data || !data.products) {
    return [];
  }
  
  return data.products.edges.map((edge: { node: any }) => edge.node);
}