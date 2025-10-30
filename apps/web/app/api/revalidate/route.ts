import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Revalidation disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  if (!body || body.secret !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const paths: string[] = Array.isArray(body.paths) ? body.paths : ["/"];
  paths.forEach((path) => revalidatePath(path));
  revalidatePath("/");

  return NextResponse.json({ revalidated: paths.length + 1 });
}
