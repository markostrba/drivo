import { NextResponse } from "next/server";

export function GET() {
  const content = `
User-agent: *
Disallow: /
Disallow: /documents
Disallow: /images
Disallow: /media
Disallow: /others


Allow: /sign-in
Allow: /sign-up

`;

  return new NextResponse(content.trim(), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
