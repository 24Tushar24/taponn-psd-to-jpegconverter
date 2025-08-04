import { NextResponse } from "next/server";

export async function GET() {
  // Mock project data
  const projects = [
    { id: "1", name: "Project Alpha" },
    { id: "2", name: "Website Redesign" },
    { id: "3", name: "Mobile App UI" },
    { id: "4", name: "Brand Assets" },
    { id: "5", name: "Marketing Materials" },
  ];

  return NextResponse.json({ projects });
}
