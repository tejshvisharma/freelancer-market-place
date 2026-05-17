import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  workExperienceSchema,
  type WorkExperienceInput,
} from "@/features/freelancer/schemas/freelancer.schema";
import {
  useAddExperience,
  useDeleteExperience,
  useFreelancerProfile,
  useUpdateExperience,
} from "@/features/freelancer/hooks";

type WorkExperienceFormValues = z.input<typeof workExperienceSchema>;

const defaultValues: WorkExperienceFormValues = {
  title: "",
  company: "",
  location: "",
  from: "",
  to: "",
  current: false,
  description: "",
};

const formatMonthYear = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const toMonthInput = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const normalizeMonthValue = (value?: string) => {
  if (!value) return "";
  return `${value}-01`;
};

export const ExperienceSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const addForm = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues,
    mode: "onChange",
  });

  const editForm = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues,
    mode: "onChange",
  });

  const addMutation = useAddExperience({ setError: addForm.setError });
  const updateMutation = useUpdateExperience({ setError: editForm.setError });
  const deleteMutation = useDeleteExperience();

  const experiences = profile?.workExperience ?? [];
  const addCurrent = !!addForm.watch("current");
  const editCurrent = !!editForm.watch("current");

  const metaCountClass = useMemo(() => {
    if (experiences.length === 0) return "text-muted-foreground";
    if (experiences.length >= 3) return "text-primary";
    return "text-muted-foreground";
  }, [experiences.length]);

  const openAddForm = () => {
    setIsAdding(true);
    setEditingId(null);
    setConfirmDeleteId(null);
    addForm.reset(defaultValues);
  };

  const closeAddForm = () => {
    setIsAdding(false);
    addForm.reset(defaultValues);
  };

  const openEditForm = (item: any) => {
    setEditingId(item._id);
    setIsAdding(false);
    setConfirmDeleteId(null);
    editForm.reset({
      title: item.title ?? "",
      company: item.company ?? "",
      location: item.location ?? "",
      from: toMonthInput(item.from),
      to: toMonthInput(item.to),
      current: !!item.current,
      description: item.description ?? "",
    });
  };

  const closeEditForm = () => {
    setEditingId(null);
    editForm.reset(defaultValues);
  };

  const buildPayload = (values: WorkExperienceFormValues): WorkExperienceInput => ({
    ...values,
    current: !!values.current,
    from: normalizeMonthValue(values.from),
    to: values.current ? "" : normalizeMonthValue(values.to),
  });

  const handleAddSubmit = (values: WorkExperienceFormValues) => {
    addMutation.mutate(buildPayload(values), {
      onSuccess: () => {
        closeAddForm();
      },
    });
  };

  const handleEditSubmit = (values: WorkExperienceFormValues) => {
    if (!editingId) return;
    updateMutation.mutate(
      { expId: editingId, data: buildPayload(values) },
      { onSuccess: () => closeEditForm() },
    );
  };

  const handleDelete = (expId: string) => {
    deleteMutation.mutate(expId, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading work history...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Work Experience
            </h2>
            <p className="text-sm text-muted-foreground">
              Detail your professional journey to showcase your expertise.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${metaCountClass}`}>
              {experiences.length} roles
            </span>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              + Add Experience
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="rounded-2xl border border-primary/40 bg-background/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Add Experience
              </h3>
              <button
                type="button"
                onClick={closeAddForm}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Job Title
                  </label>
                  <input
                    type="text"
                    {...addForm.register("title")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Senior Frontend Developer"
                  />
                  {addForm.formState.errors.title?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {addForm.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Company
                  </label>
                  <input
                    type="text"
                    {...addForm.register("company")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="TechCorp Inc."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    {...addForm.register("location")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={addCurrent}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      addForm.setValue("current", checked);
                      if (checked) addForm.setValue("to", "");
                    }}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  <label className="text-xs text-muted-foreground">
                    Currently working here
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Start Date
                  </label>
                  <input
                    type="month"
                    {...addForm.register("from")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    End Date
                  </label>
                  <input
                    type="month"
                    {...addForm.register("to")}
                    disabled={addCurrent}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={4}
                  {...addForm.register("description")}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe your impact and responsibilities"
                />
                {addForm.formState.errors.description?.message && (
                  <p className="mt-2 text-xs text-status-error">
                    {addForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/70 pt-4">
                <button
                  type="button"
                  onClick={closeAddForm}
                  className="h-10 rounded-full border border-border bg-transparent px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {addMutation.isPending ? "Saving..." : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        )}

        {experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Add your work history to build credibility
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Highlight the roles and results that show your experience.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Add Experience
            </button>
          </div>
        ) : (
          <div className="relative space-y-6 pl-8">
            <div className="absolute left-3 top-2 h-full w-px bg-border/60" />
            {experiences.map((item: any) => {
              const range = [
                formatMonthYear(item.from),
                item.current ? "Present" : formatMonthYear(item.to),
              ]
                .filter(Boolean)
                .join(" - ");
              const meta = [range, item.location].filter(Boolean).join(" | ");

              return (
                <div key={item._id} className="relative">
                  <span className="absolute -left-[21px] top-6 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {item.title}
                          </h3>
                          {item.current && (
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        {item.company && (
                          <p className="text-sm font-medium text-primary">
                            {item.company}
                          </p>
                        )}
                        {meta && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {meta}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === item._id ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              Are you sure?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="rounded-full bg-status-error/10 px-3 py-1 text-status-error"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-full border border-border px-3 py-1 text-foreground"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-muted"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item._id)}
                              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-status-error"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {editingId === item._id && (
                    <div className="mt-4 rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">
                          Edit Experience
                        </h4>
                        <button
                          type="button"
                          onClick={closeEditForm}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Job Title
                            </label>
                            <input
                              type="text"
                              {...editForm.register("title")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            {editForm.formState.errors.title?.message && (
                              <p className="mt-2 text-xs text-status-error">
                                {editForm.formState.errors.title.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Company
                            </label>
                            <input
                              type="text"
                              {...editForm.register("company")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Location
                            </label>
                            <input
                              type="text"
                              {...editForm.register("location")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <input
                              type="checkbox"
                              checked={editCurrent}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                editForm.setValue("current", checked);
                                if (checked) editForm.setValue("to", "");
                              }}
                              className="h-4 w-4 rounded border-border text-primary"
                            />
                            <label className="text-xs text-muted-foreground">
                              Currently working here
                            </label>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Start Date
                            </label>
                            <input
                              type="month"
                              {...editForm.register("from")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              End Date
                            </label>
                            <input
                              type="month"
                              {...editForm.register("to")}
                              disabled={editCurrent}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Description
                          </label>
                          <textarea
                            rows={4}
                            {...editForm.register("description")}
                            className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          {editForm.formState.errors.description?.message && (
                            <p className="mt-2 text-xs text-status-error">
                              {editForm.formState.errors.description.message}
                            </p>
                          )}
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/70 pt-4">
                          <button
                            type="button"
                            onClick={closeEditForm}
                            className="h-10 rounded-full border border-border bg-transparent px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
