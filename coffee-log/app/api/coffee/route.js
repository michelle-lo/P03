import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("coffee_entries")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("GET /api/coffee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const drink_name = String(body.drink_name ?? "").trim();
    const location_name = String(body.location_name ?? "").trim();

    if (!drink_name || !location_name) {
      return NextResponse.json(
        { error: "Drink name and location are required." },
        { status: 400 }
      );
    }

    // Cast numeric types correctly
    const sweetness = body.sweetness ? Number(body.sweetness) : null;
    const rating = body.rating ? Number(body.rating) : null;
    const price = body.price ? Number(body.price) : null;
    const lat = body.lat ? Number(body.lat) : null;
    const lng = body.lng ? Number(body.lng) : null;

    const date = body.date ? new Date(body.date).toISOString() : null;

    const added_by = body.added_by ? String(body.added_by).trim() : null;

    const notes = body.notes ? String(body.notes).trim() : null;

    const { data, error } = await supabase
    .from("coffee_entries")
    .insert([
        {
        drink_name,
        sweetness,
        location_name,
        lat,
        lng,
        rating,
        price,
        image_url: body.image_url ?? null,
        date,
        added_by,  
        notes
        },
    ])
    .select()
    .single();

    if (error) {
      console.error("POST /api/coffee error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/coffee error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
