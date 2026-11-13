import { describe, expect, it } from "vitest";
import { TERMS_ACCEPTANCE_EN, TERMS_CONDITIONS_EN } from "@/db/seed/default-content";
import { formatInrAmount } from "@/features/cms/public-offerings-repo";
import { extractProcessSteps, extractTermsLists } from "@/features/cms/public-pages-repo";

describe("public CMS repository helpers", () => {
  it("extracts process steps from valid CMS metadata JSON", () => {
    const steps = extractProcessSteps([
      {
        sectionKey: "process_steps",
        titleEn: "Steps",
        titleTe: "దశలు",
        subtitleEn: "",
        subtitleTe: "",
        bodyEn: "",
        bodyTe: "",
        metadataJson: JSON.stringify({
          steps: [
            { step: 1, en: "Send details", te: "వివరాలు పంపండి" },
            { step: 2, en: "Verify independently", te: "విచారణ చేసుకోండి" },
          ],
        }),
      },
    ]);

    expect(steps).toEqual([
      { step: 1, en: "Send details", te: "వివరాలు పంపండి" },
      { step: 2, en: "Verify independently", te: "విచారణ చేసుకోండి" },
    ]);
  });

  it("falls back to default 6 process steps when metadata is empty or malformed", () => {
    const emptySteps = extractProcessSteps([]);
    const malformedSteps = extractProcessSteps([
      {
        sectionKey: "process_steps",
        titleEn: "",
        titleTe: "",
        subtitleEn: "",
        subtitleTe: "",
        bodyEn: "",
        bodyTe: "",
        metadataJson: "{invalid-json",
      },
    ]);

    expect(emptySteps).toHaveLength(6);
    expect(malformedSteps).toHaveLength(6);
    expect(emptySteps[0]?.step).toBe(1);
  });

  it("extracts default legal terms lists and merges valid CMS overrides", () => {
    const defaults = extractTermsLists([]);
    expect(defaults.conditionsEn).toEqual(TERMS_CONDITIONS_EN);
    expect(defaults.acceptanceEn).toEqual(TERMS_ACCEPTANCE_EN);

    const overridden = extractTermsLists([
      {
        sectionKey: "terms_conditions",
        titleEn: "",
        titleTe: "",
        subtitleEn: "",
        subtitleTe: "",
        bodyEn: "",
        bodyTe: "",
        metadataJson: JSON.stringify({
          conditionsEn: ["Custom Condition 1"],
          conditionsTe: ["కస్టమ్ నియమం 1"],
        }),
      },
      {
        sectionKey: "terms_acceptance",
        titleEn: "",
        titleTe: "",
        subtitleEn: "",
        subtitleTe: "",
        bodyEn: "",
        bodyTe: "",
        metadataJson: JSON.stringify({
          pointsEn: ["Custom Acceptance 1"],
        }),
      },
    ]);

    expect(overridden.conditionsEn).toEqual(["Custom Condition 1"]);
    expect(overridden.conditionsTe).toEqual(["కస్టమ్ నియమం 1"]);
    expect(overridden.acceptanceEn).toEqual(["Custom Acceptance 1"]);
  });

  it("formats Indian Rupee amounts without decimal digits", () => {
    expect(formatInrAmount(10000)).toBe("₹10,000");
    expect(formatInrAmount(250000)).toBe("₹2,50,000");
  });
});
