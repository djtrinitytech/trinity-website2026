// Registration submission.
// UI-only for now: resolves after a short delay so the form's loading/success states work.
// To go live, replace the body with a Supabase insert, e.g.
//
//   import { supabase } from "../lib/supabaseClient";
//   const { error } = await supabase.from("registrations").insert({
//     full_name: data.fullName,
//     username: data.username,
//     email: data.email,
//     phone: data.phone,
//     alt_phone: data.altPhone || null,
//     college: data.college,
//     department: data.department,
//     year: data.year,
//   });
//   if (error) throw error;

export async function submitRegistration(data) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true, data };
}
