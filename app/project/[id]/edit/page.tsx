import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectEditor } from '@/components/project/project-editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('novel_projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch structure
  const { data: structureData } = await supabase
    .from('novel_structures')
    .select('*')
    .eq('project_id', id)
    .single()

  // Map database fields to component interface
  const structure = structureData ? {
    id: structureData.id,
    world_building: structureData.world_setting,
    synopsis: structureData.story_synopsis,
    themes: structureData.themes,
  } : null

  // Fetch characters (they're linked to structure_id, not project_id)
  const { data: characters } = await supabase
    .from('novel_characters')
    .select('*')
    .eq('structure_id', structureData?.id)
    .order('created_at', { ascending: true })

  // Fetch chapters
  const { data: chapters } = await supabase
    .from('novel_chapters')
    .select('*')
    .eq('project_id', id)
    .order('chapter_number', { ascending: true })

  return (
    <ProjectEditor
      project={project}
      structure={structure}
      characters={characters || []}
      chapters={chapters || []}
    />
  )
}
