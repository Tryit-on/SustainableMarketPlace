import { storage } from "../storage";
import { sendEmail } from "../email";

// Runs once daily. Deactivates expired certifications and sends renewal warnings.
export function startCertificationExpiryJob(): void {
  runExpiryCheck();
  // 24h interval
  setInterval(runExpiryCheck, 24 * 60 * 60 * 1000);
}

async function runExpiryCheck(): Promise<void> {
  try {
    // Deactivate already-expired certifications
    const deactivated = await storage.deactivateExpiredCertifications();
    if (deactivated > 0) {
      console.log(`[cert-expiry] Deactivated ${deactivated} expired certifications`);
    }

    // Send renewal warnings for certifications expiring within 60 days
    const expiring60 = await storage.getExpiringCertifications(60);
    const expiring30 = await storage.getExpiringCertifications(30);
    const expiring7 = await storage.getExpiringCertifications(7);

    // Only email at each threshold once per day — send to the narrowest window that applies
    const toNotify60 = expiring60.filter(
      (c) => !expiring30.find((e) => e.id === c.id)
    );
    const toNotify30 = expiring30.filter(
      (c) => !expiring7.find((e) => e.id === c.id)
    );
    const toNotify7 = expiring7;

    for (const cert of toNotify7) {
      if (!cert.user.email) continue;
      await sendEmail({
        to: cert.user.email,
        subject: "GreenMart — Certification expires in 7 days",
        text: `Hi ${cert.user.sellerName ?? "there"},\n\nYour ${cert.certificationBody.name} certification expires in 7 days. Please upload a renewed certificate to keep your products live.\n\nLog in at: https://greenmart.com/seller/dashboard\n\nGreenMart Team`,
      });
    }

    for (const cert of toNotify30) {
      if (!cert.user.email) continue;
      await sendEmail({
        to: cert.user.email,
        subject: "GreenMart — Certification expires in 30 days",
        text: `Hi ${cert.user.sellerName ?? "there"},\n\nYour ${cert.certificationBody.name} certification expires in 30 days. Please arrange renewal soon.\n\nLog in at: https://greenmart.com/seller/dashboard\n\nGreenMart Team`,
      });
    }

    for (const cert of toNotify60) {
      if (!cert.user.email) continue;
      await sendEmail({
        to: cert.user.email,
        subject: "GreenMart — Certification expires in 60 days",
        text: `Hi ${cert.user.sellerName ?? "there"},\n\nA heads-up: your ${cert.certificationBody.name} certification expires in ~60 days. No action needed yet, but worth noting.\n\nGreenMart Team`,
      });
    }
  } catch (error) {
    console.error("[cert-expiry] Job failed:", error);
  }
}
