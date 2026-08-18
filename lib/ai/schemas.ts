import { z } from 'zod'

// Phase 1 scope: schemas mirror today's existing fields exactly (mechanical
// AI-SDK swap, zero behavior change). Agent-pipeline fields (goal ladder,
// beat tags, etc.) are added to these in later phases.

export const CharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  motivation: z.string(),
})

export const StructureOutputSchema = z.object({
  worldSetting: z.string(),
  mainCharacters: z.array(CharacterSchema).min(1),
  plotSummary: z.string(),
  themes: z.array(z.string()),
  timeline: z.string(),
})

export const OutlineChapterSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  outline: z.string(),
})

export const OutlineOutputSchema = z.object({
  chapters: z.array(OutlineChapterSchema).min(1),
})
