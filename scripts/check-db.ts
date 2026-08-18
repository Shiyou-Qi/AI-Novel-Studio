
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database...');
  
  // Check projects
  const { data: projects, error: projectError } = await supabase
    .from('novel_projects')
    .select('*')
    .limit(5);

  if (projectError) {
    console.error('Error fetching projects:', projectError);
  } else {
    console.log('Projects found:', projects?.length);
    projects?.forEach(p => {
        console.log(`- Project: ${p.title} (${p.id}) Status: ${p.status}`);
    });
  }

  // Check structures
  const { data: structures, error: structureError } = await supabase
    .from('novel_structures')
    .select('*')
    .limit(5);

  if (structureError) {
    console.error('Error fetching structures:', structureError);
  } else {
    console.log('Structures found:', structures?.length);
    structures?.forEach(s => {
        console.log(`- Structure for Project ${s.project_id}: World Setting length: ${s.world_setting?.length}`);
    });
  }
}

checkData();
