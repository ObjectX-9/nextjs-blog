import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}`);
    }

    const buffer = await response.arrayBuffer();
    const headers = {
      "Content-Type": response.headers.get("content-type") || "image/jpeg",
      "Access-Control-Allow-Origin": "*",
    };

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
