import { z } from 'zod'

// Structured-output reliability: across every schema below, individual field
// values occasionally come back missing/null from a single LLM call (more
// often as the surrounding JSON gets larger - more chapters of context, more
// array entries per call). Failing the whole call over one dropped field
// wastes the bounded retry in generate-json.ts on something a simple default
// would have fixed. These helpers coerce missing/null to a safe fallback
// *before* Zod's own type check runs, so a gap in one field never invalidates
// an otherwise-good response. Only applied to fields where downstream code
// already treats "empty/default" as meaningfully safe (e.g. an empty-string
// characterName/threadId just fails a lookup and gets skipped, never crashes
// or corrupts data) - NOT applied to array-level `.min()` constraints, where
// genuinely insufficient content should still fail and trigger a real retry.
function softString(fallback = '') {
  return z.preprocess((val) => val ?? fallback, z.string())
}
function softEnum<T extends [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.preprocess((val) => val ?? fallback, z.enum(values))
}
function softArray<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => val ?? [], z.array(schema))
}

export const CharacterSchema = z.object({
  name: softString(),
  role: softString(),
  description: softString(),
  motivation: softString(),
})

// Architect Agent (Phase 3): protagonist goal ladder, antagonist forces,
// genre tropes, and CTR-oriented title/blurb candidates - on top of the
// original structure fields.
export const GoalLadderStepSchema = z.object({
  stage: softString(),
  goal: softString(),
  obstacle: softString(),
  payoff: softString(),
})

export const AntagonistForceSchema = z.object({
  name: softString(),
  type: softEnum(['person', 'organization', 'system', 'nature', 'self'], 'person'),
  motivation: softString(),
  threatLevel: softEnum(['early', 'mid', 'late', 'final'], 'mid'),
})

export const TitleCandidateSchema = z.object({
  title: softString(),
  rationale: softString(),
})

export const StructureOutputSchema = z.object({
  worldSetting: softString(),
  mainCharacters: z.array(CharacterSchema).min(1),
  plotSummary: softString(),
  themes: softArray(z.string()),
  timeline: softString(),
  protagonistGoalLadder: z.array(GoalLadderStepSchema).min(3),
  antagonistForces: z.array(AntagonistForceSchema).min(1),
  genreTropes: softArray(z.string()),
  titleCandidates: z.array(TitleCandidateSchema).min(3).max(5),
  blurb: softString(),
})

// Outline/Pacing Agent (Phase 4): per-chapter beat tagging + foreshadowing
// thread planting/payoff tracking, on top of the original title/outline.
export const BeatTypeEnum = z.enum(['setup', 'rising', 'satisfaction', 'suspense', 'twist', 'cliffhanger'])
// UI label map: setup:'铺垫' rising:'上升' satisfaction:'爽点' suspense:'悬念' twist:'反转' cliffhanger:'悬念钩子'

export const OutlineChapterSchema = z.object({
  number: z.preprocess((val) => val ?? 0, z.number().int()),
  title: softString(),
  outline: softString(),
  beatType: z.preprocess((val) => val ?? 'setup', BeatTypeEnum),
  hookNote: softString(),
  isGoldenChapter: z.preprocess((val) => val ?? false, z.boolean()),
})

export const NewPlotThreadSchema = z.object({
  title: softString(),
  description: softString(),
  plantedChapter: z.preprocess((val) => val ?? 0, z.number().int()),
  intendedPayoffChapter: z.number().int().nullable().catch(null),
  importance: softEnum(['minor', 'major'], 'minor'),
})

export const ThreadUpdateSchema = z.object({
  threadId: softString(),
  status: softEnum(['reinforced', 'paid_off'], 'reinforced'),
  note: softString(),
})

export const OutlineOutputSchema = z.object({
  chapters: z.array(OutlineChapterSchema).min(1),
  newPlotThreads: softArray(NewPlotThreadSchema),
  threadUpdates: softArray(ThreadUpdateSchema),
})

// Chapter quality pipeline (Phase 5): Hook Doctor, Continuity Checker,
// Quality Critic.
export const HookDoctorOutputSchema = z.object({
  needsRewrite: z.preprocess((val) => val ?? false, z.boolean()),
  rewrittenEnding: z.string().nullable().catch(null),
  techniqueUsed: softString(),
  rationale: softString(),
})

export const ContinuityIssueSchema = z.object({
  severity: softEnum(['minor', 'major'], 'minor'),
  description: softString(),
  suggestion: softString(),
})

export const CharacterStateUpdateSchema = z.object({
  characterName: softString(),
  updatedState: softString(),
  relationshipChanges: z.string().nullable().catch(null),
})

export const ContinuityThreadUpdateSchema = z.object({
  threadId: softString(),
  newStatus: softEnum(['reinforced', 'paid_off', 'abandoned'], 'reinforced'),
  note: softString(),
})

export const ContinuityCheckOutputSchema = z.object({
  issues: softArray(ContinuityIssueSchema),
  characterStateUpdates: softArray(CharacterStateUpdateSchema),
  newWorldFacts: softArray(z.string()),
  threadUpdates: softArray(ContinuityThreadUpdateSchema),
})

const scoreField = z.preprocess((val) => val ?? 60, z.number().int().min(0).max(100))

export const QualityScoreSchema = z.object({
  hookStrength: scoreField,
  pacing: scoreField,
  satisfactionDensity: scoreField,
  dialogueNaturalness: scoreField,
  showVsTell: scoreField,
  overall: scoreField,
  notes: softArray(z.string()),
})
