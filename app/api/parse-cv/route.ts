import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { ExtractedCvSchema, toCvData, type ExtractedCv } from "@/lib/cv-schema";
import { isSectionHeading, parseCvText } from "@/lib/parse-cv-text";
import { extractPdfLines } from "@/lib/pdf-text";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

const SYSTEM_PROMPT = `You extract structured data from résumés / CVs.
Copy the candidate's wording faithfully; do not invent, embellish, or summarize away details.
Rules:
- Keep dates exactly as written in the document.
- For each experience or education entry, put every bullet point or responsibility on its own line prefixed with "- " in the description.
- If the CV is not in English, keep the original language.
- Use empty strings or empty arrays for anything the CV does not contain.
- Skill level: 5 for expert/advanced, 4 for proficient, 3 when unspecified, 2 for basic, 1 for beginner.
- Website and link URLs: strip the protocol (no "https://").`;

type AiOutcome = { ok: true; data: ExtractedCv } | { ok: false; reason: string; configured: boolean };

function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

async function extractWithClaude(pdfBase64: string): Promise<AiOutcome> {
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            {
              type: "text",
              text: "Extract all the information from this CV into the requested structure.",
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ExtractedCvSchema), effort: "medium" },
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, reason: "the model declined to process this document", configured: true };
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return { ok: false, reason: "the model response could not be parsed", configured: true };
    }
    return { ok: true, data: response.parsed_output };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, reason: "the API key was rejected", configured: true };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, reason: "the API rate limit was reached", configured: true };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, reason: `the API returned an error (${error.status})`, configured: true };
    }
    const message = error instanceof Error ? error.message : "unknown error";
    return { ok: false, reason: message, configured: isConfigured() };
  }
}

export async function POST(request: Request) {
  let file: File | null = null;
  let form: FormData;
  try {
    form = await request.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "The PDF is larger than 10 MB." }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf = bytes.length > 4 && String.fromCharCode(...bytes.subarray(0, 4)) === "%PDF";
  if (!isPdf) return NextResponse.json({ error: "That file is not a PDF." }, { status: 415 });

  // Plain text is needed for the fallback parser and to detect scanned PDFs.
  let text = "";
  let links: string[] = [];
  try {
    const extracted = await extractPdfLines(bytes, isSectionHeading);
    text = extracted.lines.join("\n");
    links = extracted.links;
  } catch {
    // Unreadable with pdf.js; the AI path may still handle it.
  }

  // Development aid: return the reconstructed text alongside the result.
  const debug = process.env.NODE_ENV !== "production" && form.get("debug") === "1";

  if (isConfigured()) {
    const outcome = await extractWithClaude(Buffer.from(bytes).toString("base64"));
    if (outcome.ok) {
      return NextResponse.json({ data: toCvData(outcome.data), source: "ai" });
    }
    if (!text.trim()) {
      return NextResponse.json(
        { error: `AI extraction failed (${outcome.reason}) and the PDF has no selectable text.` },
        { status: 502 },
      );
    }
    return NextResponse.json({
      data: toCvData(parseCvText(text, links)),
      source: "heuristic",
      warning: `AI extraction failed (${outcome.reason}), so basic text parsing was used instead. Please review each section.`,
    });
  }

  if (!text.trim()) {
    return NextResponse.json(
      {
        error:
          "This PDF has no selectable text (it may be scanned). Set ANTHROPIC_API_KEY to enable AI extraction, which can read scanned documents.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    data: toCvData(parseCvText(text, links)),
    source: "heuristic",
    warning:
      "Imported with basic text parsing. Set ANTHROPIC_API_KEY on the server for more accurate AI extraction. Please review each section.",
    ...(debug ? { text } : {}),
  });
}
