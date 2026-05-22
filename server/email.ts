interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Uses Resend if RESEND_API_KEY is set; falls back to console log in dev
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email dev]", payload.to, payload.subject);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "GreenMart <noreply@greenmart.com>",
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email error]", res.status, body);
  }
}
