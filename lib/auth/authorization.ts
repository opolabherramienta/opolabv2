import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

// Check the database on each invocation. Never trust editable user_metadata,
// a role supplied by a form, or a role cached in a long-lived JWT.
export async function requireAdmin() {
  const context = await requireUser();
  const { data, error } = await context.supabase.rpc("security_is_admin");
  if (error || data !== true) redirect("/dashboard");
  return context;
}
