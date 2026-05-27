const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching templates...");
  const { data: templates, error } = await supabase.from('socioeconomic_templates').select('*');
  if (error) {
    console.error("Error fetching templates:", error);
    return;
  }
  
  templates.forEach(t => {
    console.log(`\n========================================`);
    console.log(`Template: "${t.name}" (ID: ${t.id})`);
    console.log(`========================================`);
    const schema = t.form_schema || [];
    const familyFields = schema.filter(f => 
      f.id.includes('padre') || 
      f.id.includes('madre') || 
      f.id.includes('hermano') || 
      f.id.includes('hijo') || 
      f.id.includes('fam') || 
      f.id.includes('conyuge') ||
      f.id.includes('espos') ||
      f.id.includes('parentesco')
    );
    console.log(`Found ${familyFields.length} family-related fields:`);
    familyFields.forEach(f => {
      console.log(`- id: "${f.id}", label: "${f.label}", tipo: "${f.tipo}", section: "${f.section}"`);
    });
  });
}

run();
