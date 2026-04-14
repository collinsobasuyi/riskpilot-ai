// lib/risk/controls.ts

export interface ControlRecommendation {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

type RiskLevel = "Low" | "Medium" | "High";

export function getRecommendedControls(
  level: RiskLevel
): ControlRecommendation[] {
  const base: ControlRecommendation[] = [
    {
      title: "Document the AI system purpose and boundaries",
      description:
        "Maintain a clear description of what the AI does, where it is used, and what it must not be used for.",
      priority: "Medium",
    },
    {
      title: "Define human oversight and escalation",
      description:
        "Specify who reviews decisions, how overrides work, and how incidents are handled.",
      priority: "Medium",
    },
  ];

  if (level === "Low") {
    return [
      ...base,
      {
        title: "Basic monitoring",
        description:
          "Track performance and failures; review changes when the AI workflow is updated.",
        priority: "Low",
      },
    ];
  }

  if (level === "Medium") {
    return [
      ...base,
      {
        title: "Risk register for AI use case",
        description:
          "Log risks, owners, mitigation actions, and review cadence for the AI system.",
        priority: "Medium",
      },
      {
        title: "Data governance checks",
        description:
          "Confirm data sources, data minimisation, retention, and access controls are defined.",
        priority: "Medium",
      },
    ];
  }

  return [
    ...base,
    {
      title: "Formal AI governance controls",
      description:
        "Implement approval gates, documented controls, and periodic governance reviews aligned to ISO 42001 principles.",
      priority: "High",
    },
    {
      title: "Testing and validation plan",
      description:
        "Define test datasets, bias/error checks where relevant, and clear acceptance criteria for model changes.",
      priority: "High",
    },
    {
      title: "Incident management and audit readiness",
      description:
        "Create incident response procedures and maintain evidence to support audit or regulatory queries.",
      priority: "High",
    },
  ];
}
