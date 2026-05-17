import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  educationSchema,
  type EducationInput,
} from "@/features/freelancer/schemas/freelancer.schema";
import {
  useAddEducation,
  useDeleteEducation,
  useFreelancerProfile,
  useUpdateEducation,
} from "@/features/freelancer/hooks";

type EducationFormValues = z.input<typeof educationSchema>;

const defaultValues: EducationFormValues = {
  school: "",
  degree: "",
  fieldOfStudy: "",
  from: "",
  to: "",
  current: false,
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

export const EducationSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const addForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues,
    mode: "onChange",
  });

  const editForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues,
    mode: "onChange",
  });

  const addMutation = useAddEducation({ setError: addForm.setError });
  const updateMutation = useUpdateEducation({ setError: editForm.setError });
  const deleteMutation = useDeleteEducation();

  const education = profile?.education ?? [];
  const addCurrent = !!addForm.watch("current");
  const editCurrent = !!editForm.watch("current");

  const metaCountClass = useMemo(() => {
    if (education.length === 0) return "text-muted-foreground";
    if (education.length >= 2) return "text-primary";
    return "text-muted-foreground";
  }, [education.length]);

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
      school: item.school ?? "",
      degree: item.degree ?? "",
      fieldOfStudy: item.fieldOfStudy ?? "",
      from: toMonthInput(item.from),
      to: toMonthInput(item.to),
      current: !!item.current,
    });
  };

  const closeEditForm = () => {
    setEditingId(null);
    editForm.reset(defaultValues);
  };

  const buildPayload = (values: EducationFormValues): EducationInput => ({
    ...values,
    current: !!values.current,
    from: normalizeMonthValue(values.from),
    to: values.current ? "" : normalizeMonthValue(values.to),
  });

  const handleAddSubmit = (values: EducationFormValues) => {
    addMutation.mutate(buildPayload(values), {
      onSuccess: () => closeAddForm(),
    });
  };

  const handleEditSubmit = (values: EducationFormValues) => {
    if (!editingId) return;
    updateMutation.mutate(
      { eduId: editingId, data: buildPayload(values) },
      { onSuccess: () => closeEditForm() },
    );
  };

  const handleDelete = (eduId: string) => {
    deleteMutation.mutate(eduId, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading education...</span>
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
              Education
            </h2>
            <p className="text-sm text-muted-foreground">
              Share the education that supports your expertise.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${metaCountClass}`}>
              {education.length} records
            </span>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              + Add Education
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="rounded-2xl border border-primary/40 bg-background/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Add Education
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
                    School
                  </label>
                  <input
                    type="text"
                    {...addForm.register("school")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="University of California"
                  />
                  {addForm.formState.errors.school?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {addForm.formState.errors.school.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Degree
                  </label>
                  <input
                    type="text"
                    {...addForm.register("degree")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="B.Sc. Computer Science"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    {...addForm.register("fieldOfStudy")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Software Engineering"
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
                    Currently enrolled
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
                  {addMutation.isPending ? "Saving..." : "Save Education"}
                </button>
              </div>
            </form>
          </div>
        )}

        {education.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Add your educational background
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Share degrees and programs that strengthen your profile.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Add Education
            </button>
          </div>
        ) : (
          <div className="relative space-y-6 pl-8">
            <div className="absolute left-3 top-2 h-full w-px bg-border/60" />
            {education.map((item: any) => {
              const range = [
                formatMonthYear(item.from),
                item.current ? "Present" : formatMonthYear(item.to),
              ]
                .filter(Boolean)
                .join(" - ");
              const details = [item.degree, item.fieldOfStudy]
                .filter(Boolean)
                .join(" | ");

              return (
                <div key={item._id} className="relative">
                  <span className="absolute -left-[21px] top-6 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {item.school}
                          </h3>
                          {item.current && (
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        {details && (
                          <p className="text-sm font-medium text-primary">
                            {details}
                          </p>
                        )}
                        {range && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {range}
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
                  </div>

                  {editingId === item._id && (
                    <div className="mt-4 rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">
                          Edit Education
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
                              School
                            </label>
                            <input
                              type="text"
                              {...editForm.register("school")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            {editForm.formState.errors.school?.message && (
                              <p className="mt-2 text-xs text-status-error">
                                {editForm.formState.errors.school.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Degree
                            </label>
                            <input
                              type="text"
                              {...editForm.register("degree")}
                              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              {...editForm.register("fieldOfStudy")}
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
                              Currently enrolled
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

export default EducationSection;
