'use client'

import { useCallback, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface StoryBibleState {
  worldFacts: string[]
}

export interface CharacterStateEntry {
  characterId: string
  name: string
  currentState: string
}

export interface OpenThreadEntry {
  id: string
  title: string
  description: string
}

export interface PipelineLogEntry {
  chapterNumber: number
  stage: string
  message: string
  timestamp: number
}

export type PipelineMode = 'fast' | 'quality'

interface PipelineChapter {
  id: string
  chapter_number: number
  title: string
  outline: string
  beat_type?: string | null
  is_golden_chapter?: boolean
}

interface StructureContext {
  worldSetting: string
  plotSummary: string
  mainCharacters: { id: string; name: string; role: string; description: string; motivation: string }[]
}

interface PipelineDeps {
  supabase: SupabaseClient
  projectId: string
  projectTitle: string
  theme: string
  genre: string
  wordsPerChapter: number
  guidance: string | null
  structure: StructureContext
  onChapterContentUpdate: (chapterId: string, content: string) => void
  onChapterPersisted: (chapterId: string, patch: Record<string, unknown>) => void
}

const QUALITY_THRESHOLD = 70
const MAX_REVISION_PASSES = 2

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || err.details || `请求失败 (${res.status})`)
  }
  return res.json()
}

async function postStream(url: string, body: unknown, onChunk?: (accumulated: string) => void): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || err.details || `请求失败 (${res.status})`)
  }
  if (!res.body) throw new Error('服务器未返回内容')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let content = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    content += decoder.decode(value, { stream: true })
    onChunk?.(content)
  }
  return content
}

export function useChapterPipeline(deps: PipelineDeps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentLabel, setCurrentLabel] = useState('')
  const [log, setLog] = useState<PipelineLogEntry[]>([])
  const [storyBible, setStoryBible] = useState<StoryBibleState>({ worldFacts: [] })
  const [characterStates, setCharacterStates] = useState<CharacterStateEntry[]>([])
  const [openThreads, setOpenThreads] = useState<OpenThreadEntry[]>([])
  const stopRequested = useRef(false)

  const appendLog = useCallback((chapterNumber: number, stage: string, message: string) => {
    setLog(prev => [...prev, { chapterNumber, stage, message, timestamp: Date.now() }])
  }, [])

  const loadContext = useCallback(async () => {
    const { supabase, projectId } = deps

    const { data: bible } = await supabase
      .from('novel_story_bible')
      .select('world_facts')
      .eq('project_id', projectId)
      .maybeSingle()
    setStoryBible({ worldFacts: bible?.world_facts || [] })

    const { data: states } = await supabase
      .from('novel_character_states')
      .select('character_id, current_state, novel_characters(name)')
      .eq('project_id', projectId)
    setCharacterStates((states || []).map((s: any) => ({
      characterId: s.character_id,
      name: s.novel_characters?.name || '未知角色',
      currentState: s.current_state || '',
    })))

    const { data: threads } = await supabase
      .from('novel_plot_threads')
      .select('id, title, description')
      .eq('project_id', projectId)
      .in('status', ['planted', 'reinforced'])
    setOpenThreads((threads || []).map(t => ({ id: t.id, title: t.title, description: t.description || '' })))
  }, [deps])

  const persistChapter = useCallback(async (chapterId: string, patch: Record<string, unknown>) => {
    await deps.supabase.from('novel_chapters').update(patch).eq('id', chapterId)
    deps.onChapterPersisted(chapterId, patch)
  }, [deps])

  const recordRun = useCallback(async (chapterId: string, stage: string, status: 'completed' | 'failed', extra: Record<string, unknown> = {}) => {
    await deps.supabase.from('novel_agent_runs').insert({
      project_id: deps.projectId,
      chapter_id: chapterId,
      stage,
      status,
      model: 'deepseek-v4-flash',
      ...extra,
    })
  }, [deps])

  const applyContinuityResult = useCallback(async (result: {
    characterStateUpdates: { characterName: string; updatedState: string; relationshipChanges: string | null }[]
    newWorldFacts: string[]
    threadUpdates: { threadId: string; newStatus: string; note: string }[]
  }, chapterNumber: number) => {
    const { supabase, projectId } = deps

    if (result.newWorldFacts.length > 0) {
      const merged = [...new Set([...storyBible.worldFacts, ...result.newWorldFacts])]
      await supabase.from('novel_story_bible').upsert(
        { project_id: projectId, world_facts: merged, updated_through_chapter: chapterNumber },
        { onConflict: 'project_id' }
      )
      setStoryBible({ worldFacts: merged })
    }

    if (result.characterStateUpdates.length > 0) {
      const nextStates = [...characterStates]
      for (const update of result.characterStateUpdates) {
        const character = deps.structure.mainCharacters.find(c => c.name === update.characterName)
        if (!character) continue // model named someone not in the cast - ignore rather than guess
        const combinedState = update.relationshipChanges
          ? `${update.updatedState}（关系：${update.relationshipChanges}）`
          : update.updatedState

        // upsert on character_id (unique per novel_character_states) so this
        // creates the row on the first continuity check for a character and
        // updates it on every one after - previously this only ever updated,
        // so state rows never got created in the first place and every
        // subsequent check kept finding nothing to update.
        const { error: upsertError } = await supabase
          .from('novel_character_states')
          .upsert(
            {
              project_id: projectId,
              character_id: character.id,
              current_state: combinedState,
              updated_through_chapter: chapterNumber,
            },
            { onConflict: 'character_id' }
          )
        if (upsertError) {
          console.error('Failed to upsert character state:', upsertError)
          continue
        }

        const existing = nextStates.find(s => s.characterId === character.id)
        if (existing) {
          existing.currentState = combinedState
        } else {
          nextStates.push({ characterId: character.id, name: character.name, currentState: combinedState })
        }
      }
      setCharacterStates(nextStates)
    }

    if (result.threadUpdates.length > 0) {
      let nextThreads = [...openThreads]
      for (const update of result.threadUpdates) {
        if (!nextThreads.some(t => t.id === update.threadId)) continue // defensive: only trust real IDs
        await supabase
          .from('novel_plot_threads')
          .update({
            status: update.newStatus,
            actual_payoff_chapter: update.newStatus === 'paid_off' ? chapterNumber : undefined,
          })
          .eq('id', update.threadId)
        if (update.newStatus === 'paid_off' || update.newStatus === 'abandoned') {
          nextThreads = nextThreads.filter(t => t.id !== update.threadId)
        }
      }
      setOpenThreads(nextThreads)
    }
  }, [deps, storyBible, characterStates, openThreads])

  const runChapter = useCallback(async (chapter: PipelineChapter, mode: PipelineMode) => {
    const { projectTitle, theme, genre, wordsPerChapter, guidance, structure } = deps
    const chapterNum = chapter.chapter_number

    // Drafting
    setCurrentLabel(`第 ${chapterNum} 章：正在起草...`)
    await persistChapter(chapter.id, { status: 'drafting' })
    appendLog(chapterNum, 'draft', '开始起草正文')

    let content = ''
    try {
      content = await postStream('/api/generate-chapter', {
        title: projectTitle,
        theme,
        genre,
        wordsPerChapter,
        guidance,
        structure: {
          worldSetting: structure.worldSetting,
          mainCharacters: structure.mainCharacters,
        },
        chapter: { number: chapterNum, title: chapter.title, outline: chapter.outline },
        worldFacts: storyBible.worldFacts,
        characterStates: characterStates.map(c => ({ name: c.name, currentState: c.currentState })),
        beatType: chapter.beat_type,
        isGoldenChapter: chapter.is_golden_chapter,
      }, (acc) => deps.onChapterContentUpdate(chapter.id, acc))
      await recordRun(chapter.id, 'draft', 'completed')
    } catch (err) {
      await recordRun(chapter.id, 'draft', 'failed', { error_message: err instanceof Error ? err.message : String(err) })
      await persistChapter(chapter.id, { status: 'failed' })
      throw err
    }

    await persistChapter(chapter.id, { content, word_count: content.length })
    appendLog(chapterNum, 'draft', `起草完成，${content.length} 字`)

    if (mode === 'quality') {
      // Hook Doctor
      setCurrentLabel(`第 ${chapterNum} 章：检查结尾钩子...`)
      await persistChapter(chapter.id, { status: 'hook_review' })
      try {
        const hookResult = await postJson<{ needsRewrite: boolean; rewrittenEnding: string | null; techniqueUsed: string }>('/api/agents/hook-doctor', {
          chapterContent: content,
          chapterSummary: chapter.outline,
          genre,
        })
        if (hookResult.needsRewrite && hookResult.rewrittenEnding) {
          const paragraphs = content.split(/\n\n+/)
          const keep = paragraphs.slice(0, Math.max(paragraphs.length - 2, 1))
          content = `${keep.join('\n\n')}\n\n${hookResult.rewrittenEnding}`
          await persistChapter(chapter.id, { content, word_count: content.length, hook_notes: hookResult.techniqueUsed || null })
          appendLog(chapterNum, 'hook_doctor', `结尾已重写（${hookResult.techniqueUsed || '钩子优化'}）`)
        } else {
          appendLog(chapterNum, 'hook_doctor', '结尾钩子合格，无需修改')
        }
        await recordRun(chapter.id, 'hook_doctor', 'completed')
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await recordRun(chapter.id, 'hook_doctor', 'failed', { error_message: message })
        appendLog(chapterNum, 'hook_doctor', `钩子检测失败，跳过（不影响后续步骤）：${message}`)
      }
    }

    // Continuity Check (both modes)
    setCurrentLabel(`第 ${chapterNum} 章：检查连贯性...`)
    await persistChapter(chapter.id, { status: 'continuity_check' })
    let continuityIssues: string[] = []
    try {
      const continuityResult = await postJson<{
        issues: { severity: string; description: string; suggestion: string }[]
        characterStateUpdates: { characterName: string; updatedState: string; relationshipChanges: string | null }[]
        newWorldFacts: string[]
        threadUpdates: { threadId: string; newStatus: string; note: string }[]
      }>('/api/agents/continuity-check', {
        chapterContent: content,
        chapterNumber: chapterNum,
        storyBible,
        characterStates: characterStates.map(c => ({ characterId: c.characterId, name: c.name, currentState: c.currentState })),
        openThreads,
      })
      await applyContinuityResult(continuityResult, chapterNum)
      continuityIssues = continuityResult.issues.map(i => `[${i.severity}] ${i.description} - ${i.suggestion}`)
      appendLog(chapterNum, 'continuity_check', continuityResult.issues.length > 0
        ? `发现 ${continuityResult.issues.length} 处连贯性问题`
        : '连贯性检查通过')
      await recordRun(chapter.id, 'continuity_check', 'completed', { output_summary: { issueCount: continuityResult.issues.length } })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await recordRun(chapter.id, 'continuity_check', 'failed', { error_message: message })
      appendLog(chapterNum, 'continuity_check', `连贯性检查失败，跳过（不影响后续步骤）：${message}`)
    }

    if (mode === 'fast') {
      await persistChapter(chapter.id, { status: 'completed' })
      appendLog(chapterNum, 'completed', '快速模式完成')
      return
    }

    // Quality Critic + bounded revision loop
    setCurrentLabel(`第 ${chapterNum} 章：质量评分...`)
    await persistChapter(chapter.id, { status: 'quality_review' })
    let qualityScore = QUALITY_THRESHOLD
    let qualityNotes: string[] = []
    let passes = 0
    try {
      while (true) {
        const quality = await postJson<{ overall: number; notes: string[] }>('/api/agents/quality-critic', {
          chapterContent: content,
          genre,
          beatType: chapter.beat_type,
          isGoldenChapter: chapter.is_golden_chapter,
        })
        qualityScore = quality.overall
        qualityNotes = quality.notes
        appendLog(chapterNum, 'quality_critic', `质量评分：${quality.overall}/100`)
        await recordRun(chapter.id, 'quality_critic', 'completed', { output_summary: { overall: quality.overall } })

        if (quality.overall >= QUALITY_THRESHOLD || passes >= MAX_REVISION_PASSES) break

        setCurrentLabel(`第 ${chapterNum} 章：第 ${passes + 1} 次修订...`)
        await persistChapter(chapter.id, { status: 'revising' })
        content = await postStream('/api/agents/reviser', {
          chapterContent: content,
          qualityNotes,
          continuityIssues,
        }, (acc) => deps.onChapterContentUpdate(chapter.id, acc))
        await persistChapter(chapter.id, { content, word_count: content.length })
        passes++
        appendLog(chapterNum, 'reviser', `完成第 ${passes} 次修订`)
        await recordRun(chapter.id, 'reviser', 'completed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      appendLog(chapterNum, 'quality_critic', `质量评分/修订出错，按当前内容完成：${message}`)
    }

    await persistChapter(chapter.id, {
      status: 'completed',
      quality_score: qualityScore,
      needs_review: qualityScore < QUALITY_THRESHOLD,
    })
    appendLog(chapterNum, 'completed', `完成，最终评分 ${qualityScore}/100${qualityScore < QUALITY_THRESHOLD ? '（低于阈值，已标记待人工复核）' : ''}`)
  }, [deps, storyBible, characterStates, openThreads, persistChapter, recordRun, appendLog, applyContinuityResult])

  const runRange = useCallback(async (chapters: PipelineChapter[], mode: PipelineMode) => {
    stopRequested.current = false
    setIsRunning(true)
    setLog([])
    try {
      await loadContext()
      for (const chapter of chapters) {
        if (stopRequested.current) break
        try {
          await runChapter(chapter, mode)
        } catch (err) {
          appendLog(chapter.chapter_number, 'error', err instanceof Error ? err.message : '未知错误')
          break
        }
      }
    } finally {
      setIsRunning(false)
      setCurrentLabel('')
    }
  }, [loadContext, runChapter, appendLog])

  const stop = useCallback(() => { stopRequested.current = true }, [])

  return { isRunning, currentLabel, log, storyBible, characterStates, openThreads, runRange, stop, loadContext }
}
