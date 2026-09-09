import { z } from "zod";

export const LAB_BANNER =
  "TRAINING SIMULATION — closed homelab. No mail is sent or received. No credentials leave this app. All artifacts are fictional.";

export const difficultySchema = z.enum(["intro", "intermediate", "advanced"]);
export const categorySchema = z.enum(["email", "web", "SMS", "vishing", "url", "smishing", "social", "qr", "attachment"]);
export const authResultSchema = z.enum(["pass", "fail", "none"]);

export const emailUrlSchema = z.object({
  display: z.string(),
  href: z.string(),
  hostname: z.string(),
  punycode: z.string(),
  tld: z.string(),
  suspiciousTld: z.boolean(),
  redirectChain: z.array(z.string()),
});

export const emailAttachmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  sha256: z.string(),
});

export const emailImageSchema = z.object({
  alt: z.string(),
  src: z.string(),
});

export const emailSampleSchema = z.object({
  id: z.string().min(1),
  folder: z.string().default("Inbox"),
  fromName: z.string(),
  fromAddr: z.string(),
  replyTo: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string(),
  preview: z.string(),
  html: z.string(),
  rawSource: z.string(),
  headers: z.string(),
  auth: z.object({
    spf: authResultSchema,
    dkim: authResultSchema,
    dmarc: authResultSchema,
  }),
  urls: z.array(emailUrlSchema),
  attachments: z.array(emailAttachmentSchema),
  images: z.array(emailImageSchema),
  language: z.object({
    locale: z.string(),
    tone: z.array(z.string()),
    urgencyScore: z.number().min(0).max(100),
  }),
  sendingIps: z.array(z.string()).default([]),
  fakeLoginIndicators: z.array(z.string()).default([]),
  credentialHarvest: z.boolean().default(false),
});

export const labStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  prompt: z.string(),
  hint: z.string().optional(),
  checkType: z.enum(["manual", "flag", "choice", "visit-lure"]),
  expected: z.array(z.string()).optional(),
  /** Optional accepted variants (AiTM, Adversary in the Middle, …). */
  aliases: z.array(z.string()).optional(),
  choices: z.array(z.string()).optional(),
  points: z.number().int().nonnegative(),
});

export const scoringRubricSchema = z.object({
  id: z.string(),
  description: z.string(),
  points: z.number().int().nonnegative(),
});

export const labFlagSchema = z.object({
  id: z.string(),
  label: z.string(),
  check: z.enum(["equals", "contains", "any"]),
  value: z.string(),
  points: z.number().int().nonnegative(),
});

export const labDefinitionSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string(),
  difficulty: difficultySchema,
  category: categorySchema,
  minutes: z.number().int().positive(),
  learningObjectives: z.array(z.string()).default([]),
  steps: z.array(labStepSchema).default([]),
  hints: z.array(z.string()).default([]),
  scoringRubric: z.array(scoringRubricSchema).default([]),
  flags: z.array(labFlagSchema).default([]),
  renderer: z.string().default("generic"),
  emailSamples: z.array(emailSampleSchema).default([]),
  published: z.boolean().default(false),
});

export type LabDefinition = z.infer<typeof labDefinitionSchema>;
export type LabStep = z.infer<typeof labStepSchema>;
export type EmailSample = z.infer<typeof emailSampleSchema>;
export type LabRecord = {
  definition: LabDefinition;
  source: "file" | "database";
  readonly: boolean;
};

export function parseLabDefinition(raw: unknown): LabDefinition {
  return labDefinitionSchema.parse(raw);
}
