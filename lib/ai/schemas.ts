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

export const OutlineChapterSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  outline: z.string(),
})

export const OutlineOutputSchema = z.object({
  chapters: z.array(OutlineChapterSchema).min(1),
})
