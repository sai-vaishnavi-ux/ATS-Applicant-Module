import { supabase } from "./config.js";
import { Resend } from "resend";

export async function createApplicant(data) {
  const code = `ATS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error } = await supabase
    .from("applicants")
    .insert({
      ...data,
      application_code: code
    });

  if (error) throw error;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ATS <noreply@ats.com>",
    to: "admin@ats.com",
    subject: "New Applicant Received",
    html: `
      <h3>New Application</h3>
      <p><b>Name:</b> ${data.full_name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Application Code:</b> ${code}</p>
    `
  });

  return { success: true, application_code: code };
}
