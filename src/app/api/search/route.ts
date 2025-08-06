import { NextResponse } from "next/server";

// Mock data structure based on your MongoDB data
interface ProductData {
  _id: string;
  product_type: string;
  image_url: string;
  uploaded_at: string;
  filename: string;
}

interface SearchResult {
  id: string;
  name: string;
  type: "image";
  image_url: string;
  uploaded_at: string;
  product_type: string;
  path: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}

// Function to fetch products from the FastAPI backend
async function fetchProductsFromAPI(): Promise<ProductData[]> {
  try {
    const response = await fetch("https://your-railway-backend.up.railway.app/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data.products && Array.isArray(data.products)) {
      return data.products;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn("Unexpected API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products from API:", error);
    return getMockData();
  }
}

// Mock data for when backend is unavailable
function getMockData(): ProductData[] {
  return [
    {
      _id: "1",
      product_type: "metal_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      uploaded_at: "2025-07-31T12:00:00.000Z",
      filename: "metal_card_design_1.jpg",
    },
    {
      _id: "2",
      product_type: "metal_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/golden_gate.jpg",
      uploaded_at: "2025-07-30T12:00:00.000Z",
      filename: "metal_card_design_2.jpg",
    },
    {
      _id: "3",
      product_type: "nfc_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/kitten_1.jpg",
      uploaded_at: "2025-07-31T12:00:00.000Z",
      filename: "nfc_card_design_1.jpg",
    },
    {
      _id: "4",
      product_type: "nfc_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/kitten_2.jpg",
      uploaded_at: "2025-07-24T12:00:00.000Z",
      filename: "nfc_card_design_2.jpg",
    },
    {
      _id: "5",
      product_type: "standees",
      image_url: "https://res.cloudinary.com/demo/image/upload/building.jpg",
      uploaded_at: "2025-07-31T12:00:00.000Z",
      filename: "standee_design_1.jpg",
    },
    {
      _id: "6",
      product_type: "standees",
      image_url: "https://res.cloudinary.com/demo/image/upload/couple.jpg",
      uploaded_at: "2025-07-30T12:00:00.000Z",
      filename: "standee_design_2.jpg",
    },
  ];
}

function buildPath(product: ProductData): string {
  const date = new Date(product.uploaded_at);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${product.product_type}/${year}/${month}/${day}`;
}

function buildBreadcrumbs(
  product: ProductData
): Array<{ name: string; path: string }> {
  const date = new Date(product.uploaded_at);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const productTypeDisplay = product.product_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return [
    { name: "Products", path: "" },
    { name: productTypeDisplay, path: product.product_type },
    { name: year.toString(), path: `${product.product_type}/${year}` },
    {
      name: monthNames[month - 1],
      path: `${product.product_type}/${year}/${month}`,
    },
    {
      name: `Day ${day}`,
      path: `${product.product_type}/${year}/${month}/${day}`,
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const products = await fetchProductsFromAPI();

    // Search logic: match filename, product type, or partial matches
    const searchResults: SearchResult[] = products
      .filter((product: ProductData) => {
        const searchTerm = query.toLowerCase();
        const filename = product.filename.toLowerCase();
        const productType = product.product_type
          .toLowerCase()
          .replace(/_/g, " ");

        return (
          filename.includes(searchTerm) ||
          productType.includes(searchTerm) ||
          product._id.includes(searchTerm)
        );
      })
      .map((product: ProductData) => ({
        id: product._id,
        name: product.filename,
        type: "image" as const,
        image_url: product.image_url,
        uploaded_at: product.uploaded_at,
        product_type: product.product_type,
        path: buildPath(product),
        breadcrumbs: buildBreadcrumbs(product),
      }));

    return NextResponse.json({
      results: searchResults,
      query: query.trim(),
      total: searchResults.length,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
