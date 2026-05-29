import { NextRequest, NextResponse } from "next/server";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { computeResults } from "../../../lib/risk/scoring";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as AssessmentFormData;

  if (!data.companyName || !data.systemName || !data.aiUseCase) {
    return NextResponse.json(
      { error: "Missing required fields: companyName, systemName, aiUseCase" },
      { status: 400 }
    );
  }

  const results = computeResults(data);
  return NextResponse.json(results);
}
