import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function DELETE(_req, context) {
    // params is a Promise → unwrap it
    const { id } = await context.params;
  
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }
  
    const { error } = await supabase
      .from("coffee_entries")
      .delete()
      .eq("id", numericId);
  
    if (error) {
      console.error("DELETE /api/coffee/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ success: true });
  }
  
export async function PUT(req, context) {
    const { id } = await context.params;
    const numericId = Number(id);
  
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }
  
    try {
      const body = await req.json();
  
      const updates = {
        drink_name: body.drink_name,
        sweetness:
          body.sweetness !== undefined && body.sweetness !== ""
            ? Number(body.sweetness)
            : null,
        location_name: body.location_name,
        lat:
          body.lat !== undefined && body.lat !== ""
            ? Number(body.lat)
            : null,
        lng:
          body.lng !== undefined && body.lng !== ""
            ? Number(body.lng)
            : null,
        rating:
          body.rating !== undefined && body.rating !== ""
            ? Number(body.rating)
            : null,
        price:
          body.price !== undefined && body.price !== ""
            ? Number(body.price)
            : null,
        image_url: body.image_url || null,
        date: body.date ? new Date(body.date).toISOString() : null,
        notes: body.notes || null,
      };
  
      const { data, error } = await supabase
        .from("coffee_entries")
        .update(updates)
        .eq("id", numericId)
        .select()
        .single();
  
      if (error) {
        console.error("PUT /api/coffee/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      if (!data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
  
      return NextResponse.json(data);
    } catch (err) {
      console.error("PUT /api/coffee/[id] error:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
  

