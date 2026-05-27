import requests
import json

SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co"
SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

try:
    print("Fetching templates from socioeconomic_templates table...")
    response = requests.get(f"{SUPABASE_URL}/rest/v1/socioeconomic_templates?select=id,drive_file_id,name", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Successfully retrieved {len(data)} templates:")
        for t in data[:10]:
            print(f"  - ID: {t['id']} | Name: {t['name']} | Drive ID: {t['drive_file_id']}")
        if len(data) > 10:
            print(f"  ... and {len(data) - 10} more.")
    else:
        print("Failed to fetch templates. Status code:", response.status_code)
        print("Response:", response.text)
except Exception as e:
    print("Error querying Supabase:", e)
