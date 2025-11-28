// app/api/ping/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "pong from the backend" });
}
