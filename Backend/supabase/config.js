import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

console.log("ENV CHECK:", url, key ? "KEY OK" : "NO KEY");

if (!url || !key) {
  throw new Error("Supabase env not loaded");
}

export const supabase = createClient(url, key);
