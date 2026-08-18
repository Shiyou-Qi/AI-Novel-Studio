'use client'

import { create } from 'zustand'
import type { NovelProject, Chapter, NovelStructure, ProjectFormData } from './types'

interface NovelStore {
  currentProject: NovelProject | null
  currentStep: 'create' | 'structure' | 'outline' | 'write' | 'export'
  currentChapterId: string | null
  isGenerating: boolean
  
  // Actions
  setCurrentProject: (project: NovelProject | null) => void
  updateProject: (updates: Partial<NovelProject>) => void
  setCurrentStep: (step: NovelStore['currentStep']) => void
  setCurrentChapterId: (id: string | null) => void
  setIsGenerating: (value: boolean) => void
  
  // Project actions
  createProject: (data: ProjectFormData) => NovelProject
  updateStructure: (structure: NovelStructure) => void
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void
  addChapters: (chapters: Chapter[]) => void
}

export const useNovelStore = create<NovelStore>((set, get) => ({
  currentProject: null,
  currentStep: 'create',
  currentChapterId: null,
  isGenerating: false,
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) => {
    const { currentProject } = get()
    if (!currentProject) return
    set({
      currentProject: {
        ...currentProject,
        ...updates,
        updatedAt: new Date(),
      },
    })
  },
  
  setCurrentStep: (step) => set({ currentStep: step }),
  setCurrentChapterId: (id) => set({ currentChapterId: id }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  
  createProject: (data) => {
    const project: NovelProject = {
      id: crypto.randomUUID(),
      title: data.title,
      theme: data.theme,
      genre: data.genre,
      targetChapters: data.targetChapters,
      wordsPerChapter: data.wordsPerChapter,
      guidance: data.guidance,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      chapters: [],
    }
    set({ currentProject: project, currentStep: 'structure' })
    return project
  },
  
  updateStructure: (structure) => {
    const { currentProject } = get()
    if (!currentProject) return
    set({
      currentProject: {
        ...currentProject,
        structure,
        status: 'planning',
        updatedAt: new Date(),
      },
    })
  },
  
  addChapters: (chapters) => {
    const { currentProject } = get()
    if (!currentProject) return
    set({
      currentProject: {
        ...currentProject,
        chapters,
        updatedAt: new Date(),
      },
    })
  },
  
  updateChapter: (chapterId, updates) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updatedChapters = currentProject.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, ...updates } : ch
    )
    set({
      currentProject: {
        ...currentProject,
        chapters: updatedChapters,
        updatedAt: new Date(),
      },
    })
  },
}))
