import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FOUNDING_MEMBER_LIMIT = 500;

async function addToEmailOctopus(email: string): Promise<void> {
  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!apiKey || !listId) return;

  await fetch(`https://emailoctopus.com/api/1.6/lists/${listId}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email_address: email, status: "SUBSCRIBED" }),
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { email?: string; ref?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, ref } = body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Get current count
  const { count, error: countError } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const currentCount = count ?? 0;

  if (currentCount >= FOUNDING_MEMBER_LIMIT) {
    return NextResponse.json(
      { error: "Founding Member spots are full. Follow us for launch updates." },
      { status: 409 }
    );
  }

  const position = currentCount + 1;

  const { error: insertError } = await supabase
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase(), ref: ref ?? null, position });

  if (insertError) {
    // Unique constraint violation = duplicate email
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You're already on the list! We'll be in touch soon." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await addToEmailOctopus(email.trim().toLowerCase());

  return NextResponse.json({ success: true, position });
}
