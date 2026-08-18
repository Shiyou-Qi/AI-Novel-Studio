
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

// Using the anon key (unauthenticated) means RLS will return empty row sets
// for real data, but a query against a missing table/column still errors
// clearly - which is exactly what we need to confirm the migration ran.
async function checkTable(table: string) {
  const { error } = await supabase.from(table).select('id').limit(1);
  console.log(error ? `FAIL  ${table}: ${error.message}` : `OK    ${table} exists`);
}

async function checkColumns(table: string, columns: string[]) {
  const { error } = await supabase.from(table).select(columns.join(',')).limit(1);
  console.log(error ? `FAIL  ${table}(${columns.join(',')}): ${error.message}` : `OK    ${table}(${columns.join(',')})`);
}

async function checkColumnGone(table: string, column: string) {
  const { error } = await supabase.from(table).select(column).limit(1);
  const gone = !!error && /column .* does not exist/i.test(error.message);
  console.log(gone ? `OK    ${table}.${column} correctly dropped` : `FAIL  ${table}.${column} still present or unexpected error: ${error?.message}`);
}

async function main() {
  console.log('--- New tables ---');
  await checkTable('novel_story_bible');
  await checkTable('novel_character_states');
  await checkTable('novel_plot_threads');
  await checkTable('novel_agent_runs');

  console.log('\n--- New/extended columns ---');
  await checkColumns('novel_projects', ['pipeline_mode', 'hook_cadence', 'blurb']);
  await checkColumns('novel_structures', ['protagonist_goal_ladder', 'antagonist_forces', 'genre_tropes']);
  await checkColumns('novel_chapters', ['beat_type', 'is_golden_chapter', 'hook_notes', 'quality_score', 'needs_review']);

  console.log('\n--- Dropped column ---');
  await checkColumnGone('novel_projects', 'current_step');
}

main();
