import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { error } = await supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json({ status: "alive", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
