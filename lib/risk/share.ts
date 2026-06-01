import type { AssessmentFormData } from "./schema";

export function encodeShareData(data: AssessmentFormData): string {
  const json = JSON.stringify(data);
  const base64 = btoa(encodeURIComponent(json));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeShareData(encoded: string): AssessmentFormData | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(base64));
    return JSON.parse(json) as AssessmentFormData;
  } catch {
    return null;
  }
}
