import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { CertificationBody, SellerCertification } from "@shared/schema";

interface CertificationBadgeProps {
  certificationBody: CertificationBody;
  sellerCertification: SellerCertification;
  size?: "sm" | "md";
}

// Only renders when backed by a real sellerCertification record.
// Shows expired state visually rather than silently hiding.
export function CertificationBadge({
  certificationBody,
  sellerCertification,
  size = "md",
}: CertificationBadgeProps) {
  const isExpired =
    sellerCertification.validUntil != null &&
    new Date(sellerCertification.validUntil as any) < new Date();

  const verifiedDate = sellerCertification.verifiedAt
    ? new Date(sellerCertification.verifiedAt as any).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  const validUntil = sellerCertification.validUntil
    ? new Date(sellerCertification.validUntil as any).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  const tooltipText = isExpired
    ? `${certificationBody.name} — Verification expired${validUntil ? ` on ${validUntil}` : ""}`
    : [
        certificationBody.name,
        verifiedDate ? `Verified ${verifiedDate}` : null,
        validUntil ? `Valid until ${validUntil}` : null,
      ].filter(Boolean).join(" · ");

  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`${sizeClass} gap-1 cursor-default ${
            isExpired
              ? "opacity-50 border-dashed border-muted-foreground text-muted-foreground"
              : "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
          }`}
          data-testid={`badge-cert-${certificationBody.slug}`}
        >
          {isExpired
            ? <ShieldX className="h-3 w-3" />
            : <ShieldCheck className="h-3 w-3" />
          }
          {certificationBody.name}
          {isExpired && " (expired)"}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{tooltipText}</p>
        {certificationBody.verificationUrl && !isExpired && (
          <a
            href={certificationBody.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline mt-1 block"
          >
            Verify on {certificationBody.name} website ↗
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// List wrapper — only renders badges backed by active sellerCertification rows
export function CertificationBadgeList({
  certifications,
  sellerCertifications,
  size = "md",
  max,
}: {
  certifications: CertificationBody[];
  sellerCertifications: SellerCertification[];
  size?: "sm" | "md";
  max?: number;
}) {
  if (!certifications?.length) return null;

  const pairedCerts = certifications
    .map((cert) => ({
      cert,
      sc: sellerCertifications.find((sc) => sc.certificationBodyId === cert.id),
    }))
    .filter((pair): pair is { cert: CertificationBody; sc: SellerCertification } => pair.sc != null);

  const visible = max ? pairedCerts.slice(0, max) : pairedCerts;
  const remaining = max ? pairedCerts.length - max : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map(({ cert, sc }) => (
        <CertificationBadge key={cert.id} certificationBody={cert} sellerCertification={sc} size={size} />
      ))}
      {remaining > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="text-xs cursor-default">+{remaining}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {pairedCerts.slice(max!).map(({ cert }) => (
                <p key={cert.id} className="text-sm">{cert.name}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
