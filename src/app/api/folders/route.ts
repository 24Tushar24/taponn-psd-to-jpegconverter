import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";

  // Parse the path to determine what level we're at
  const pathParts = path ? path.split("/").filter(Boolean) : [];

  if (pathParts.length === 0) {
    // Root level: Return products
    const products = [
      { id: "product-1", name: "Website Design", type: "product" },
      { id: "product-2", name: "Mobile App", type: "product" },
      { id: "product-3", name: "Brand Identity", type: "product" },
    ];
    return NextResponse.json({ items: products, currentPath: "" });
  }

  if (pathParts.length === 1) {
    // Product level: Return years
    const currentYear = 2025; // Use static year to prevent hydration issues
    const years = [];
    for (let i = 0; i < 3; i++) {
      years.push({
        id: `${pathParts[0]}-${currentYear - i}`,
        name: `${currentYear - i}`,
        type: "year",
      });
    }
    return NextResponse.json({ items: years, currentPath: path });
  }

  if (pathParts.length === 2) {
    // Year level: Return months
    const months = [
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
    ].map((month, index) => ({
      id: `${pathParts.join("-")}-${index + 1}`,
      name: month,
      type: "month",
    }));
    return NextResponse.json({ items: months, currentPath: path });
  }

  if (pathParts.length === 3) {
    // Month level: Return days
    const year = parseInt(pathParts[1]);
    const month = parseInt(pathParts[2].split("-").pop() || "1");
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        id: `${pathParts.join("-")}-${day}`,
        name: `Day ${day}`,
        type: "day",
      });
    }
    return NextResponse.json({ items: days, currentPath: path });
  }

  // Day level: Return files (PSD files for that specific day)
  const files = [
    { id: "file-1", name: "header-design.psd", type: "file", size: "2.4 MB" },
    { id: "file-2", name: "footer-layout.psd", type: "file", size: "1.8 MB" },
    {
      id: "file-3",
      name: "sidebar-component.psd",
      type: "file",
      size: "1.2 MB",
    },
  ];
  return NextResponse.json({ items: files, currentPath: path });
}
