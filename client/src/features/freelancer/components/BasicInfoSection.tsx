import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  basicInfoSchema,
  type BasicInfoInput,
} from "@/features/freelancer/schemas/freelancer.schema";
import {
  useFreelancerProfile,
  useUpdateBasicInfo,
} from "@/features/freelancer/hooks";

const MAX_HEADLINE = 200;
const MAX_BIO = 1000;
const MAX_LANGUAGES = 20;
const MAX_LANGUAGE_LENGTH = 50;

const defaultValues: BasicInfoInput = {
  headline: "",
  bio: "",
  languages: [],
};

export const BasicInfoSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const [languageInput, setLanguageInput] = useState("");

  const form = useForm<BasicInfoInput>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const updateBasicInfo = useUpdateBasicInfo({
    setError: form.setError,
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      languages: profile.languages ?? [],
    });
  }, [form, profile]);

  const headlineValue = form.watch("headline") ?? "";
  const bioValue = form.watch("bio") ?? "";

  const handleSubmit = (values: BasicInfoInput) => {
    updateBasicInfo.mutate(values);
  };

  const languageCountLabel = useMemo(() => {
    const count = form.getValues("languages")?.length ?? 0;
    return `${count} / ${MAX_LANGUAGES}`;
  }, [form]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-8">
        <header className="space-y-1 border-b border-border pb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Basic Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Update the headline, bio, and languages clients see first.
          </p>
        </header>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="headline" className="font-medium text-foreground">
                Professional Headline
              </label>
              <span className="text-xs text-muted-foreground">
                {`${headlineValue.length} / ${MAX_HEADLINE}`}
              </span>
            </div>
            <input
              id="headline"
              type="text"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Senior UI/UX Designer specialized in FinTech"
              {...form.register("headline")}
            />
            <p className="text-xs text-muted-foreground">
              A short, descriptive line that highlights your niche.
            </p>
            {form.formState.errors.headline?.message && (
              <p className="text-xs text-status-error">
                {form.formState.errors.headline.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="bio" className="font-medium text-foreground">
                About You (Bio)
              </label>
              <span className="text-xs text-muted-foreground">
                {`${bioValue.length} / ${MAX_BIO}`}
              </span>
            </div>
            <textarea
              id="bio"
              rows={6}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tell clients about your background, experience, and what you bring to the table..."
              {...form.register("bio")}
            />
            {form.formState.errors.bio?.message && (
              <p className="text-xs text-status-error">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <Controller
            control={form.control}
            name="languages"
            render={({ field }) => {
              const languages = field.value ?? [];

              const addLanguage = (rawValue: string) => {
                const value = rawValue.trim();
                if (!value) return;

                if (value.length > MAX_LANGUAGE_LENGTH) {
                  form.setError("languages", {
                    message: "Each language must be 50 characters or less",
                  });
                  return;
                }

                const exists = languages.some(
                  (language) => language.toLowerCase() === value.toLowerCase(),
                );
                if (exists) {
                  setLanguageInput("");
                  return;
                }

                if (languages.length >= MAX_LANGUAGES) {
                  form.setError("languages", {
                    message: "Maximum 20 languages allowed",
                  });
                  return;
                }

                field.onChange([...languages, value]);
                form.clearErrors("languages");
                setLanguageInput("");
              };

              const handleKeyDown = (
                event: React.KeyboardEvent<HTMLInputElement>,
              ) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addLanguage(languageInput);
                }
              };

              const removeLanguage = (languageToRemove: string) => {
                const nextLanguages = languages.filter(
                  (language) => language !== languageToRemove,
                );
                field.onChange(nextLanguages);
              };

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium text-foreground">
                      Languages
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {languageCountLabel}
                    </span>
                  </div>

                  <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    {languages.map((language) => (
                      <span
                        key={language}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(language)}
                          className="rounded-full text-primary/70 transition hover:text-primary"
                        >
                          <span className="text-[12px]">x</span>
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={languageInput}
                      onChange={(event) => setLanguageInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        languages.length ? "Add another language..." : "Add a language..."
                      }
                      className="min-w-[160px] flex-1 border-none bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {form.formState.errors.languages?.message && (
                    <p className="text-xs text-status-error">
                      {form.formState.errors.languages.message}
                    </p>
                  )}
                </div>
              );
            }}
          />

          <div className="flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              Changes update your public profile instantly.
            </p>
            <button
              type="submit"
              disabled={updateBasicInfo.isPending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updateBasicInfo.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BasicInfoSection;
