import Image from "next/image";
import type { FormBranding } from "@/lib/form/types";

/** Configured logo, or a quiet monogram placeholder when no asset is provided. */
export function BrandMark({ branding }: { branding: FormBranding }) {
  if (branding.logoUrl) {
    return (
      <Image
        src={branding.logoUrl}
        alt=""
        width={36}
        height={36}
        unoptimized
        className="size-24 shrink-0 rounded-lg object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-sm font-semibold tracking-tight text-foreground"
    >
      {branding.logoText ?? "·"}
    </span>
  );
}
