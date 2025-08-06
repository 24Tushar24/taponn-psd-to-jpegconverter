import { NextResponse } from "next/server";

// Mock data structure based on your MongoDB data
interface ProductData {
  _id: string;
  product_type: string;
  image_url: string;
  uploaded_at: string;
  filename: string;
}

// Function to fetch products from the FastAPI backend
async function fetchProductsFromAPI(): Promise<ProductData[]> {
  try {
    const response = await fetch("https://your-railway-backend.up.railway.app/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control to ensure fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // The API might return data in different formats, handle both cases
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
    // Return mock data when backend is not available
    return getMockData();
  }
}

// Mock data for when backend is unavailable
function getMockData(): ProductData[] {
  // Use static dates to prevent hydration issues
  const now = "2025-07-31T12:00:00.000Z";
  const yesterday = "2025-07-30T12:00:00.000Z";
  const lastWeek = "2025-07-24T12:00:00.000Z";

  return [
    {
      _id: "1",
      product_type: "metal_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      uploaded_at: now,
      filename: "metal_card_design_1.jpg",
    },
    {
      _id: "2",
      product_type: "metal_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/golden_gate.jpg",
      uploaded_at: yesterday,
      filename: "metal_card_design_2.jpg",
    },
    {
      _id: "3",
      product_type: "nfc_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/kitten_1.jpg",
      uploaded_at: now,
      filename: "nfc_card_design_1.jpg",
    },
    {
      _id: "4",
      product_type: "nfc_cards",
      image_url: "https://res.cloudinary.com/demo/image/upload/kitten_2.jpg",
      uploaded_at: lastWeek,
      filename: "nfc_card_design_2.jpg",
    },
    {
      _id: "5",
      product_type: "standees",
      image_url: "https://res.cloudinary.com/demo/image/upload/building.jpg",
      uploaded_at: now,
      filename: "standee_design_1.jpg",
    },
    {
      _id: "6",
      product_type: "standees",
      image_url: "https://res.cloudinary.com/demo/image/upload/couple.jpg",
      uploaded_at: yesterday,
      filename: "standee_design_2.jpg",
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const pathParts = path ? path.split("/").filter(Boolean) : [];

  try {
    // Fetch products from the FastAPI backend
    const products = await fetchProductsFromAPI();

    if (pathParts.length === 0) {
      // Root level: Return the three main product type folders
      const productTypeMapping = {
        metal_cards: "Metal Cards",
        nfc_cards: "NFC Cards",
        standees: "Standees",
      };

      // Always show these three folders, even if no products exist yet
      const items = Object.entries(productTypeMapping).map(([key, name]) => {
        const productCount = products.filter(
          (p: ProductData) => p.product_type === key
        ).length;
        return {
          id: key,
          name: name,
          type: "product" as const,
          count: productCount,
        };
      });

      return NextResponse.json({ items, currentPath: "" });
    }

    if (pathParts.length === 1) {
      // Product type level: Return years for this product type
      const selectedProductType = pathParts[0];
      const filteredProducts = products.filter(
        (p: ProductData) => p.product_type === selectedProductType
      );

      const years = [
        ...new Set(
          filteredProducts.map((p: ProductData) => {
            const date = new Date(p.uploaded_at);
            return date.getFullYear();
          })
        ),
      ].sort((a: number, b: number) => b - a); // Sort years descending

      const items = years.map((year: number) => ({
        id: `${selectedProductType}/${year}`,
        name: year.toString(),
        type: "year" as const,
      }));

      return NextResponse.json({ items, currentPath: path });
    }

    if (pathParts.length === 2) {
      // Year level: Return months for this product type and year
      const [selectedProductType, selectedYear] = pathParts;
      const year = parseInt(selectedYear);

      const filteredProducts = products.filter((p: ProductData) => {
        const date = new Date(p.uploaded_at);
        return (
          p.product_type === selectedProductType && date.getFullYear() === year
        );
      });

      const months = [
        ...new Set(
          filteredProducts.map((p: ProductData) => {
            const date = new Date(p.uploaded_at);
            return date.getMonth() + 1; // 1-based month
          })
        ),
      ].sort((a: number, b: number) => b - a); // Sort months descending

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

      const items = months.map((month: number) => ({
        id: `${selectedProductType}/${selectedYear}/${month}`,
        name: monthNames[month - 1],
        type: "month" as const,
      }));

      return NextResponse.json({ items, currentPath: path });
    }

    if (pathParts.length === 3) {
      // Month level: Return days for this product type, year, and month
      const [selectedProductType, selectedYear, selectedMonth] = pathParts;
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);

      const filteredProducts = products.filter((p: ProductData) => {
        const date = new Date(p.uploaded_at);
        return (
          p.product_type === selectedProductType &&
          date.getFullYear() === year &&
          date.getMonth() + 1 === month
        );
      });

      const days = [
        ...new Set(
          filteredProducts.map((p: ProductData) => {
            const date = new Date(p.uploaded_at);
            return date.getDate();
          })
        ),
      ].sort((a: number, b: number) => b - a); // Sort days descending

      const items = days.map((day: number) => ({
        id: `${selectedProductType}/${selectedYear}/${selectedMonth}/${day}`,
        name: `Day ${day}`,
        type: "day" as const,
        count: filteredProducts.filter((p: ProductData) => {
          const date = new Date(p.uploaded_at);
          return date.getDate() === day;
        }).length,
      }));

      return NextResponse.json({ items, currentPath: path });
    }

    // Day level: Return actual image files for this specific date
    const [selectedProductType, selectedYear, selectedMonth, selectedDay] =
      pathParts;
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const day = parseInt(selectedDay);

    const filteredProducts = products.filter((p: ProductData) => {
      const date = new Date(p.uploaded_at);
      return (
        p.product_type === selectedProductType &&
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      );
    });

    const items = filteredProducts.map((product: ProductData) => ({
      id: product._id,
      name: product.filename,
      type: "image" as const,
      image_url: product.image_url,
      uploaded_at: product.uploaded_at,
      product_type: product.product_type,
    }));

    return NextResponse.json({ items, currentPath: path });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
