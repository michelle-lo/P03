import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
    q
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim likes a real UA; using something simple here is fine for class
        "User-Agent": "coffee-log-demo/1.0",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) {
      console.error("Nominatim error:", res.status, res.statusText);
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Nominatim fetch error:", err);
    // Don't blow up the UI; just return empty
    return NextResponse.json([], { status: 200 });
  }
}
