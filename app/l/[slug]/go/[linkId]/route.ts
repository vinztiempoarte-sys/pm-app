import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  after(() =>
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mini-landing-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link_id: linkId }),
    }).catch(() => {})
  );

  return NextResponse.redirect(url);
}
