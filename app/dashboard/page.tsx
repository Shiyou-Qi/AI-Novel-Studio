import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's projects with chapter counts
  const { data: projects } = await supabase
    .from('novel_projects')
    .select(`
      *,
      novel_chapters(count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Calculate stats
  const totalProjects = projects?.length || 0
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0
  const inProgressProjects = projects?.filter(p => p.status === 'writing' || p.status === 'outlining').length || 0
  
  // Fetch total chapters and words
  const { data: chaptersData } = await supabase
    .from('novel_chapters')
    .select('word_count, status')
    .in('project_id', projects?.map(p => p.id) || [])

  const totalChapters = chaptersData?.length || 0
  const completedChapters = chaptersData?.filter(c => c.status === 'completed').length || 0
  const totalWords = chaptersData?.reduce((sum, c) => sum + (c.word_count || 0), 0) || 0

  const stats = {
    totalProjects,
    completedProjects,
    inProgressProjects,
    totalChapters,
    completedChapters,
    totalWords,
  }

  return (
    <DashboardClient 
      user={user} 
      profile={profile} 
      projects={projects || []} 
      stats={stats}
    />
  )
}
