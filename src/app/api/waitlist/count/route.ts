import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FOUNDING_MEMBER_LIMIT = 500;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getServiceClient();

  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ count: 0, remaining: FOUNDING_MEMBER_LIMIT, isFull: false });
  }

  const current = count ?? 0;
  const remaining = Math.max(0, FOUNDING_MEMBER_LIMIT - current);

  return NextResponse.json(
    { count: current, remaining, isFull: remaining === 0 },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } }
  );
}
