import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import { z } from "zod";
import {
  updatePricingSchema,
} from "@/features/freelancer/schemas/freelancer.schema";
import type { UpdatePricingInput } from "@/features/freelancer/types/freelancer.types";
import {
  useFreelancerProfile,
  useUpdatePricing,
} from "@/features/freelancer/hooks";

export const PricingSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();

  type PricingFormValues = z.infer<typeof updatePricingSchema>;

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(updatePricingSchema) as any,
    defaultValues: {
      hourlyRate: undefined,
      milestonePackages: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestonePackages",
  });

  const updatePricing = useUpdatePricing({
    setError: form.setError,
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );
  const [deliverableInput, setDeliverableInput] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    if (!profile) return;
    form.reset({
      hourlyRate: profile.pricing?.hourlyRate ?? undefined,
      milestonePackages: profile.pricing?.milestonePackages ?? [],
    });
  }, [profile, form]);

  const handleSubmit = (values: PricingFormValues) => {
    updatePricing.mutate(values as UpdatePricingInput);
  };

  const handleAddPackage = () => {
    if (fields.length >= 10) return;
    append({ name: "", price: 0, deliverables: [], estimatedDays: undefined });
    setExpandedIndex(fields.length); // Expand the newly added package
  };

  const handleConfirmDelete = (index: number) => {
    const values = form.getValues();
    const nextPackages = (values.milestonePackages ?? []).filter(
      (_, i) => i !== index
    );

    remove(index);
    setDeleteConfirmIndex(null);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }

    updatePricing.mutate({
      hourlyRate: values.hourlyRate,
      milestonePackages: nextPackages,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading pricing...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_30px_80px_-55px_hsl(var(--shadow-color)/0.6)] backdrop-blur md:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative space-y-10">
        <header className="space-y-2 border-b border-border/60 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-label-caps">
            Pricing & Packages
          </p>
          <h2 className="text-2xl font-semibold text-foreground font-display">
            Set Your Rates
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Set your standard hourly rate and define fixed-price milestone
            packages.
          </p>
        </header>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          {/* Section A: Hourly Rate */}
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">
                schedule
              </span>
              <h3 className="font-semibold text-foreground text-lg">
                Base Hourly Rate
              </h3>
            </div>
            <div className="max-w-md space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground text-sm">$</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  className="block w-full pl-8 pr-3 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:border-primary text-sm shadow-sm"
                  {...form.register("hourlyRate", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.hourlyRate?.message && (
                <p className="text-xs text-status-error">
                  {form.formState.errors.hourlyRate.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Clients can filter freelancers by hourly rate. This rate will be
                displayed on your public profile and used for time-tracked
                contracts.
              </p>
            </div>
          </div>

          {/* Section B: Milestone Packages */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  view_cozy
                </span>
                <h3 className="font-semibold text-foreground text-lg">
                  Milestone Packages
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {fields.length >= 10 && (
                  <span className="text-xs text-status-error">
                    Maximum 10 packages reached
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleAddPackage}
                  disabled={fields.length >= 10}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary text-primary bg-transparent px-4 text-sm font-medium transition hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Package
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {fields.map((field, index) => {
                const isExpanded = expandedIndex === index;
                const isConfirmDelete = deleteConfirmIndex === index;

                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-border bg-background flex flex-col overflow-hidden transition-all"
                  >
                    {/* Collapsed/Header View */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-muted-foreground transition-transform">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                        <div>
                          <h4 className="font-medium text-foreground text-base">
                            {form.watch(`milestonePackages.${index}.name`) ||
                              "New Package"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ${form.watch(`milestonePackages.${index}.price`) || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConfirmDelete ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs text-status-error mr-2">
                              Delete?
                            </span>
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => setDeleteConfirmIndex(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="text-xs bg-status-error text-white px-2 py-1 rounded"
                              onClick={() => handleConfirmDelete(index)}
                            >
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmIndex(index);
                            }}
                            className="text-muted-foreground hover:text-status-error transition-colors p-2 rounded-full hover:bg-status-error/10"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="p-5 border-t border-border/60 bg-card/30 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Name Input */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">
                              Package Name *
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="e.g. Basic Website"
                              {...form.register(
                                `milestonePackages.${index}.name`
                              )}
                            />
                            {form.formState.errors.milestonePackages?.[index]
                              ?.name && (
                              <p className="text-xs text-status-error">
                                {
                                  form.formState.errors.milestonePackages[index]
                                    ?.name?.message
                                }
                              </p>
                            )}
                          </div>

                          {/* Price Input */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">
                              Price (USD) *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-muted-foreground text-sm">
                                  $
                                </span>
                              </div>
                              <input
                                type="number"
                                className="w-full pl-8 pr-3 rounded-lg border border-input bg-background py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="0"
                                {...form.register(
                                  `milestonePackages.${index}.price`,
                                  { valueAsNumber: true }
                                )}
                              />
                            </div>
                            {form.formState.errors.milestonePackages?.[index]
                              ?.price && (
                              <p className="text-xs text-status-error">
                                {
                                  form.formState.errors.milestonePackages[index]
                                    ?.price?.message
                                }
                              </p>
                            )}
                          </div>

                          {/* Estimated Days */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">
                              Estimated Days
                            </label>
                            <input
                              type="number"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="e.g. 14"
                              {...form.register(
                                `milestonePackages.${index}.estimatedDays`,
                                { valueAsNumber: true }
                              )}
                            />
                            {form.formState.errors.milestonePackages?.[index]
                              ?.estimatedDays && (
                              <p className="text-xs text-status-error">
                                {
                                  form.formState.errors.milestonePackages[index]
                                    ?.estimatedDays?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Deliverables Tag Input */}
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-medium text-foreground">
                            Deliverables (Press Enter to add)
                          </label>
                          <Controller
                            control={form.control}
                            name={`milestonePackages.${index}.deliverables`}
                            render={({ field }) => {
                              const deliverables = field.value ?? [];

                              const addDeliverable = (rawValue: string) => {
                                const value = rawValue.trim();
                                if (!value) return;

                                if (deliverables.length >= 20) {
                                  toast.error("Maximum 20 deliverables allowed");
                                  return;
                                }

                                if (value.length > 200) {
                                  toast.error(
                                    "Each deliverable must be 200 characters or less"
                                  );
                                  return;
                                }

                                if (!deliverables.includes(value)) {
                                  field.onChange([...deliverables, value]);
                                }
                                setDeliverableInput((prev) => ({
                                  ...prev,
                                  [index]: "",
                                }));
                              };

                              const handleKeyDown = (
                                event: React.KeyboardEvent<HTMLInputElement>
                              ) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === ","
                                ) {
                                  event.preventDefault();
                                  addDeliverable(
                                    deliverableInput[index] || ""
                                  );
                                }
                              };

                              const removeDeliverable = (itemToRemove: string) => {
                                field.onChange(
                                  deliverables.filter((d) => d !== itemToRemove)
                                );
                              };

                              return (
                                <div className="space-y-2">
                                  <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                    {deliverables.map((deliverable) => (
                                      <span
                                        key={deliverable}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                      >
                                        {deliverable}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDeliverable(deliverable)
                                          }
                                          className="rounded-full text-primary/70 hover:text-primary transition-colors focus:outline-none"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                    <input
                                      type="text"
                                      value={deliverableInput[index] || ""}
                                      onChange={(e) =>
                                        setDeliverableInput((prev) => ({
                                          ...prev,
                                          [index]: e.target.value,
                                        }))
                                      }
                                      onKeyDown={handleKeyDown}
                                      placeholder={
                                        deliverables.length
                                          ? "Add another..."
                                          : "e.g. 5 page design"
                                      }
                                      className="min-w-[150px] flex-1 bg-transparent text-sm text-foreground outline-none border-none p-0 focus:ring-0 placeholder:text-muted-foreground"
                                    />
                                  </div>
                                  {form.formState.errors.milestonePackages?.[
                                    index
                                  ]?.deliverables && (
                                    <p className="text-xs text-status-error">
                                      {
                                        form.formState.errors
                                          .milestonePackages[index]
                                          ?.deliverables?.message
                                      }
                                    </p>
                                  )}
                                </div>
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              Changes update your public profile instantly.
            </p>
            <button
              type="submit"
              disabled={updatePricing.isPending}
              className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updatePricing.isPending ? "Saving..." : "Save Pricing"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
