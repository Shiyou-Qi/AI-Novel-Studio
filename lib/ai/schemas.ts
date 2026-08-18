import { z } from 'zod'

export const CharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  motivation: z.string(),
})

// Architect Agent (Phase 3): protagonist goal ladder, antagonist forces,
// genre tropes, and CTR-oriented title/blurb candidates - on top of the
// original structure fields.
export const GoalLadderStepSchema = z.object({
  stage: z.string(),
  goal: z.string(),
  obstacle: z.string(),
  payoff: z.string(),
})

export const AntagonistForceSchema = z.object({
  name: z.string(),
  type: z.enum(['person', 'organization', 'system', 'nature', 'self']),
  motivation: z.string(),
  threatLevel: z.enum(['early', 'mid', 'late', 'final']),
})

export const TitleCandidateSchema = z.object({
  title: z.string(),
  rationale: z.string(),
})

export const StructureOutputSchema = z.object({
  worldSetting: z.string(),
  mainCharacters: z.array(CharacterSchema).min(1),
  plotSummary: z.string(),
  themes: z.array(z.string()),
  timeline: z.string(),
  protagonistGoalLadder: z.array(GoalLadderStepSchema).min(3),
  antagonistForces: z.array(AntagonistForceSchema).min(1),
  genreTropes: z.array(z.string()),
  titleCandidates: z.array(TitleCandidateSchema).min(3).max(5),
  blurb: z.string(),
})

// Outline/Pacing Agent (Phase 4): per-chapter beat tagging + foreshadowing
// thread planting/payoff tracking, on top of the original title/outline.
export const BeatTypeEnum = z.enum(['setup', 'rising', 'satisfaction', 'suspense', 'twist', 'cliffhanger'])
// UI label map: setup:'铺垫' rising:'上升' satisfaction:'爽点' suspense:'悬念' twist:'反转' cliffhanger:'悬念钩子'

// beatType/isGoldenChapter use preprocess to tolerate the model occasionally
// omitting or null-ing a field across a 10-chapter/6-field batch response -
// coercing to a safe default beats failing (and re-prompting for) the whole
// batch over one dropped boolean. hookNote is allowed empty for the same
// reason; it's cosmetic (drives a UI caption), not structurally load-bearing.
export const OutlineChapterSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  outline: z.string(),
  beatType: z.preprocess((val) => val ?? 'setup', BeatTypeEnum),
  hookNote: z.preprocess((val) => val ?? '', z.string()),
  isGoldenChapter: z.preprocess((val) => val ?? false, z.boolean()),
})

export const NewPlotThreadSchema = z.object({
  title: z.string(),
  description: z.string(),
  plantedChapter: z.number().int(),
  intendedPayoffChapter: z.number().int().nullable(),
  importance: z.enum(['minor', 'major']),
})

export const ThreadUpdateSchema = z.object({
  threadId: z.string(),
  status: z.enum(['reinforced', 'paid_off']),
  note: z.string(),
})

export const OutlineOutputSchema = z.object({
  chapters: z.array(OutlineChapterSchema).min(1),
  newPlotThreads: z.array(NewPlotThreadSchema),
  threadUpdates: z.array(ThreadUpdateSchema),
})

// Chapter quality pipeline (Phase 5): Hook Doctor, Continuity Checker,
// Quality Critic. All boolean/enum/number fields use the same preprocess-to-
// safe-default pattern as the outline schema, for the same reason (tolerate
// occasional field drops rather than failing the whole call).
export const HookDoctorOutputSchema = z.object({
  needsRewrite: z.preprocess((val) => val ?? false, z.boolean()),
  rewrittenEnding: z.string().nullable(),
  techniqueUsed: z.preprocess((val) => val ?? '', z.string()),
  rationale: z.preprocess((val) => val ?? '', z.string()),
})

export const ContinuityIssueSchema = z.object({
  severity: z.preprocess((val) => val ?? 'minor', z.enum(['minor', 'major'])),
  description: z.string(),
  suggestion: z.string(),
})

export const CharacterStateUpdateSchema = z.object({
  characterName: z.string(),
  updatedState: z.string(),
  relationshipChanges: z.string().nullable(),
})

export const ContinuityThreadUpdateSchema = z.object({
  threadId: z.string(),
  newStatus: z.preprocess((val) => val ?? 'reinforced', z.enum(['reinforced', 'paid_off', 'abandoned'])),
  note: z.string(),
})

export const ContinuityCheckOutputSchema = z.object({
  issues: z.array(ContinuityIssueSchema),
  characterStateUpdates: z.array(CharacterStateUpdateSchema),
  newWorldFacts: z.array(z.string()),
  threadUpdates: z.array(ContinuityThreadUpdateSchema),
})

const scoreField = z.preprocess((val) => val ?? 60, z.number().int().min(0).max(100))

export const QualityScoreSchema = z.object({
  hookStrength: scoreField,
  pacing: scoreField,
  satisfactionDensity: scoreField,
  dialogueNaturalness: scoreField,
  showVsTell: scoreField,
  overall: scoreField,
  notes: z.array(z.string()),
})
