import { NextResponse } from "next/server";

/*
robots.txt allowing all pages to be crawled and indexed.
This is intentional for SEO purposes, since this is a portfolio project.

old settings:

Disallow: /
Disallow: /documents
Disallow: /images
Disallow: /media
Disallow: /others


Allow: /sign-in
Allow: /sign-up

*/

export function GET() {
  const content = `
User-agent: *
Disallow: 
`;

  return new NextResponse(content.trim(), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
