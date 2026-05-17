import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner"
import { useFreelancerProfile, useUpdateSkills } from "@/features/freelancer/hooks";
import type { SkillItemInput } from "@/features/freelancer/schemas/freelancer.schema";

const PROFICIENCY_OPTIONS = ["Beginner", "Intermediate", "Expert"] as const;
type ProficiencyOption = (typeof PROFICIENCY_OPTIONS)[number];

const MAX_SKILLS = 50;
const WARN_SKILLS = 45;
const MAX_SKILL_LENGTH = 100;

const normalizeProficiency = (value?: string): ProficiencyOption => {
  if (value === "Advanced") return "Expert";
  if (value && PROFICIENCY_OPTIONS.includes(value as ProficiencyOption)) {
    return value as ProficiencyOption;
  }
  return "Intermediate";
};

export const SkillsSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const updateSkills = useUpdateSkills();

  const [localSkills, setLocalSkills] = useState<SkillItemInput[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] =
    useState<SkillItemInput["proficiency"]>("Intermediate");
  const [addError, setAddError] = useState<string | null>(null);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profile?.skills) return;

    const nextSkills = profile.skills.map((skill) => ({
      name: skill.name,
      proficiency: normalizeProficiency(skill.proficiency),
    }));

    setLocalSkills(nextSkills);
  }, [profile?.skills]);

  const skillCountClass = useMemo(() => {
    if (localSkills.length >= MAX_SKILLS) return "text-status-error";
    if (localSkills.length >= WARN_SKILLS) return "text-status-warning";
    return "text-muted-foreground";
  }, [localSkills.length]);

  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();

    if (!trimmed) {
      setAddError("Skill name is required");
      return;
    }

    if (trimmed.length > MAX_SKILL_LENGTH) {
      setAddError("Max 100 characters");
      return;
    }

    const duplicate = localSkills.some(
      (skill) => skill.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (duplicate) {
      toast.error("Skill already added");
      return;
    }

    if (localSkills.length >= MAX_SKILLS) {
      toast.error("You have reached the maximum of 50 skills");
      return;
    }

    setLocalSkills((prev) => [
      ...prev,
      { name: trimmed, proficiency: newSkillProficiency },
    ]);

    setNewSkillName("");
    setAddError(null);
    setActiveSkillIndex(null);
    inputRef.current?.focus();
  };

  const handleRemoveSkill = (index: number) => {
    setLocalSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProficiencyChange = (
    index: number,
    value: SkillItemInput["proficiency"],
  ) => {
    setLocalSkills((prev) =>
      prev.map((skill, i) =>
        i === index ? { ...skill, proficiency: value } : skill,
      ),
    );
  };

  const handleSave = () => {
    updateSkills.mutate({ skills: localSkills });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading skills...</span>
        </div>
      </div>
    );
  }

  const isEmpty = localSkills.length === 0;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-8">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Skills & Expertise
            </h2>
            <p className="text-sm text-muted-foreground">
              Highlight your core competencies so the right projects find you.
            </p>
          </div>
          <div className={`text-xs font-semibold ${skillCountClass}`}>
            {localSkills.length} / 50 skills
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="text-lg font-semibold text-foreground">Your Skills</h3>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {isEmpty ? "New User" : "Active Profile"}
              </span>
            </div>

            {isEmpty ? (
              <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/70 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <span className="text-2xl font-semibold">+</span>
                </div>
                <h4 className="mt-4 text-base font-semibold text-foreground">
                  No Skills Added Yet
                </h4>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Add your skills to appear in relevant searches and match with
                  the perfect freelance opportunities.
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-2">
                {localSkills.map((skill, index) => (
                  <div key={`${skill.name}-${index}`} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSkillIndex((current) =>
                          current === index ? null : index,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary/70" />
                      {skill.name}
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {skill.proficiency}
                      </span>
                      <span className="ml-1 text-muted-foreground">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground shadow-sm transition hover:text-status-error"
                      aria-label={`Remove ${skill.name}`}
                    >
                      x
                    </button>

                    {activeSkillIndex === index && (
                      <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-xl border border-border bg-background p-2 shadow-lg">
                        <p className="mb-2 text-[11px] font-semibold text-muted-foreground">
                          Proficiency
                        </p>
                        <div className="space-y-1">
                          {PROFICIENCY_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                handleProficiencyChange(index, option);
                                setActiveSkillIndex(null);
                              }}
                              className={`w-full rounded-lg px-2 py-1 text-left text-xs font-medium transition ${
                                option === skill.proficiency
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border/70 bg-background/80 p-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Add New Skill
              </label>
              <div className="mt-2 flex flex-col gap-3 md:flex-row">
                <input
                  ref={inputRef}
                  type="text"
                  value={newSkillName}
                  onChange={(event) => {
                    setNewSkillName(event.target.value);
                    setAddError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Python, UI Design..."
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={newSkillProficiency}
                  onChange={(event) =>
                    setNewSkillProficiency(
                      event.target.value as SkillItemInput["proficiency"],
                    )
                  }
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {PROFICIENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-muted px-4 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted/70"
                >
                  Add
                </button>
              </div>
              {addError && (
                <p className="mt-2 text-xs text-status-error">{addError}</p>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Skills checklist
              </h3>
              <p className="text-sm text-muted-foreground">
                Keep your list up to date. Saving updates the skills shown on
                your public profile and search results.
              </p>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li>Use specific skills clients search for.</li>
                <li>Balance tools, frameworks, and domain expertise.</li>
                <li>Review proficiency levels quarterly.</li>
              </ul>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateSkills.isPending}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateSkills.isPending ? "Saving..." : "Save Skills"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
