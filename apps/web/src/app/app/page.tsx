import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function AppPage() {
  const cookieStore = await cookies();

  // 1. Check for custom Delite demo/wallet session
  const sessionUser = cookieStore.get("delite_session_user")?.value || cookieStore.get("delite_demo_session")?.value;
  if (sessionUser) {
    return <DashboardShell userEmail={sessionUser} />;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. If Supabase is not configured or in offline/local demo mode, provide direct access
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("dummy")
  );

  if (!isSupabaseConfigured) {
    return <DashboardShell userEmail="demo@delitex.finance" />;
  }

  // 3. Query Supabase Auth
  let resolvedEmail = "demo@delitex.finance";
  let shouldRedirectToLogin = false;

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Server component — can't set cookies here; middleware handles this
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      shouldRedirectToLogin = true;
    } else {
      resolvedEmail = user.email ?? "user@delitex.finance";
    }
  } catch {
    // If Supabase network call fails, gracefully fallback to demo session
    resolvedEmail = "demo@delitex.finance";
  }

  if (shouldRedirectToLogin) {
    redirect("/login");
  }

  return <DashboardShell userEmail={resolvedEmail} />;
}

