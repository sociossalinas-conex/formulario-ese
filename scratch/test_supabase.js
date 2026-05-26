const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";

async function run() {
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`
  };

  try {
    console.log("Querying captures filtered by candidate name inside payload...");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/socioeconomic_captures?payload->>candidate_name=ilike.*Juan*&select=*`, { headers });
    console.log("Query status:", res.status);
    const data = await res.json();
    console.log("Query result:", data);
  } catch (err) {
    console.error("Query failed:", err);
  }
}

run();
