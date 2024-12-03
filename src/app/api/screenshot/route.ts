import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(
        url
      )}&screenshot=true&meta=false`
    );
    const data = await response.json();

    return NextResponse.json({
      screenshot: data.data?.screenshot?.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get screenshot" },
      { status: 500 }
    );
  }
}
