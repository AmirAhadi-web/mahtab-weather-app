import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import type { ComponentType } from "react";

import { Card } from "@/components/ui/card";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/brand-icons";
import { developer } from "@/lib/developer";

interface SocialLink {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const socials: SocialLink[] = [
  { icon: GithubIcon, label: "GitHub", href: developer.links.github },
  { icon: LinkedinIcon, label: "LinkedIn", href: developer.links.linkedin },
  { icon: InstagramIcon, label: "Instagram", href: developer.links.instagram },
];

export function DeveloperFooter() {
  return (
    <footer aria-label="About the developer">
      <div className="mx-auto w-full max-w-[76rem] px-4 pb-10 sm:px-6">
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(420px 200px at 12% 50%, rgba(255, 159, 67, 0.07), transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:justify-between sm:gap-8 sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <Image
                src={developer.photo}
                alt={`Portrait of ${developer.name}`}
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 rounded-2xl object-cover ring-1 ring-line-strong"
                priority={false}
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                  Designed &amp; developed by
                </p>
                <p className="mt-1.5 text-lg font-semibold leading-tight text-ink">
                  {developer.name}
                </p>
                <p className="text-sm font-medium text-accent">{developer.role}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3.5 sm:items-end">
              <div className="flex items-center gap-2">
                {socials.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${developer.name} on ${label}`}
                    title={label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2 text-muted transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:text-ink"
                  >
                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:justify-end">
                <a
                  href={`mailto:${developer.links.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
                >
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 text-faint" />
                  <span dir="ltr">{developer.links.email}</span>
                </a>
                <span aria-hidden="true" className="hidden h-3 w-px bg-line-strong sm:inline-block" />
                <a
                  href={`tel:${developer.links.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
                >
                  <Phone aria-hidden="true" className="h-3.5 w-3.5 text-faint" />
                  <span dir="ltr" className="tabular">{developer.links.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </footer>
  );
}
