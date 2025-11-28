import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

// DELETE /api/coffee/[id]
export async function DELETE(_req, context) {
  // 👇 params is a Promise, so await it
  const { id } = await context.params;
  const numId = Number(id);

  if (!Number.isFinite(numId)) {
    return NextResponse.json(
      { error: "Invalid id" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("coffee_entries")
    .delete()
    .eq("id", numId);

  if (error) {
    console.error("DELETE /api/coffee/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PUT /api/coffee/[id] - update entry
export async function PUT(req, context) {
  try {
    // 👇 same pattern here
    const { id } = await context.params;
    const numId = Number(id);

    if (!Number.isFinite(numId)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const drink_name = String(body.drink_name ?? "").trim();
    const location_name = String(body.location_name ?? "").trim();

    if (!drink_name || !location_name) {
      return NextResponse.json(
        { error: "Drink name and location are required." },
        { status: 400 }
      );
    }

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
      .update({
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
        notes,
      })
      .eq("id", numId)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/coffee/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("PUT /api/coffee/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
