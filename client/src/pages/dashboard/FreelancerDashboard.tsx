import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Section components ────────────────────────────────────────────────────────
import { OverviewSection } from "@/features/freelancer/components/OverviewSection";
import { BasicInfoSection } from "@/features/freelancer/components/BasicInfoSection";
import { SkillsSection } from "@/features/freelancer/components/SkillsSection";
import { PortfolioSection } from "@/features/freelancer/components/PortfolioSection";
import { ExperienceSection } from "@/features/freelancer/components/ExperienceSection";
import { EducationSection } from "@/features/freelancer/components/EducationSection";
import { CertificationsSection } from "@/features/freelancer/components/CertificationsSection";
import { AvailabilitySection } from "@/features/freelancer/components/AvailabilitySection";
import { PricingSection } from "@/features/freelancer/components/PricingSection";
import { ResumeSection } from "@/features/freelancer/components/ResumeSection";

// ── Section definitions ───────────────────────────────────────────────────────
const SECTIONS = [
  { key: "overview",       label: "Overview",            icon: "dashboard" },
  { key: "basic-info",     label: "Personal Info",       icon: "person" },
  { key: "skills",         label: "Skills",              icon: "psychology" },
  { key: "portfolio",      label: "Portfolio",           icon: "folder_special" },
  { key: "experience",     label: "Work History",        icon: "work" },
  { key: "education",      label: "Education",           icon: "school" },
  { key: "certifications", label: "Certifications",      icon: "workspace_premium" },
  { key: "availability",   label: "Availability",        icon: "schedule" },
  { key: "pricing",        label: "Pricing",             icon: "payments" },
  { key: "resume",         label: "Resume",              icon: "description" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
const DEFAULT_SECTION: SectionKey = "overview";

function SectionContent({ sectionKey }: { sectionKey: SectionKey }) {
  switch (sectionKey) {
    case "overview":       return <OverviewSection />;
    case "basic-info":     return <BasicInfoSection />;
    case "skills":         return <SkillsSection />;
    case "portfolio":      return <PortfolioSection />;
    case "experience":     return <ExperienceSection />;
    case "education":      return <EducationSection />;
    case "certifications": return <CertificationsSection />;
    case "availability":   return <AvailabilitySection />;
    case "pricing":        return <PricingSection />;
    case "resume":         return <ResumeSection />;
    default:               return <OverviewSection />;
  }
}

export default function FreelancerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const rawSection = searchParams.get("section") || DEFAULT_SECTION;
  const activeSection: SectionKey = SECTIONS.some((s) => s.key === rawSection)
    ? (rawSection as SectionKey)
    : DEFAULT_SECTION;

  const navigateTo = (key: SectionKey) => {
    if (key === DEFAULT_SECTION) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ section: key }, { replace: true });
    }
    setMobileNavOpen(false);
  };

  const activeLabel =
    SECTIONS.find((s) => s.key === activeSection)?.label || "Overview";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* ── Mobile section picker ─────────────────────────────────────── */}
      <div className="lg:hidden border-b border-border bg-background">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-foreground text-[20px]">
              {SECTIONS.find((s) => s.key === activeSection)?.icon}
            </span>
            <span className="font-medium text-sm text-foreground">
              {activeLabel}
            </span>
          </div>
          <span
            className={cn(
              "material-symbols-outlined text-muted-foreground text-[20px] transition-transform duration-200",
              mobileNavOpen && "rotate-180"
            )}
          >
            expand_more
          </span>
        </button>

        {mobileNavOpen && (
          <div className="border-t border-border bg-background max-h-[60vh] overflow-y-auto">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => navigateTo(section.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                    isActive
                      ? "bg-muted font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {section.icon}
                  </span>
                  {section.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop layout ────────────────────────────────────────────── */}
      <div className="hidden lg:inline border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex items-center gap-0.5 overflow-x-auto -mb-px">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => navigateTo(section.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 shrink-0",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {section.icon}
                  </span>
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <SectionContent sectionKey={activeSection} />
      </div>
    </div>
  );
}
