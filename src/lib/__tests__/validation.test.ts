import { describe, expect, it } from "vitest";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  isAllowedUpload,
  isNonEmptyString,
  sanitizeTitle,
} from "@/lib/validation";
import { textToTipTapContent } from "@/lib/documents";

describe("validation helpers", () => {
  it("accepts non-empty strings within limits", () => {
    expect(isNonEmptyString("Hello")).toBe(true);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString("")).toBe(false);
  });

  it("sanitizes document titles", () => {
    expect(sanitizeTitle("  Quarterly Plan  ")).toBe("Quarterly Plan");
    expect(sanitizeTitle("a".repeat(250)).length).toBe(200);
  });

  it("allows txt and md uploads only", () => {
    expect(isAllowedUpload("notes.txt", "text/plain")).toBe(true);
    expect(isAllowedUpload("readme.md", "text/markdown")).toBe(true);
    expect(isAllowedUpload("slides.pptx", "application/vnd.ms-powerpoint")).toBe(false);
    expect(ALLOWED_UPLOAD_EXTENSIONS).toEqual([".txt", ".md"]);
  });
});

describe("textToTipTapContent", () => {
  it("converts plain text lines into TipTap paragraphs", () => {
    const json = JSON.parse(textToTipTapContent("Line one\nLine two"));
    expect(json.type).toBe("doc");
    expect(json.content).toHaveLength(2);
    expect(json.content[0].content[0].text).toBe("Line one");
    expect(json.content[1].content[0].text).toBe("Line two");
  });
});
