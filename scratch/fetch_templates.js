const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";

async function run() {
  console.log("Fetching templates from socioeconomic_templates...");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/socioeconomic_templates?select=id,drive_file_id,name`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`Successfully retrieved ${data.length} templates:`);
      data.slice(0, 15).forEach(t => {
        console.log(`  - ID: ${t.id} | Name: "${t.name}" | Drive ID: ${t.drive_file_id}`);
      });
      if (data.length > 15) {
        console.log(`  ... and ${data.length - 15} more.`);
      }
    } else {
      console.error("Failed. Status:", res.status);
      console.error(await res.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
