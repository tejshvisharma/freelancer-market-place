import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import {
  certificationSchema,
  type CertificationInput,
} from "@/features/freelancer/schemas/freelancer.schema";
import {
  useAddCertification,
  useDeleteCertification,
  useFreelancerProfile,
  useUpdateCertification,
} from "@/features/freelancer/hooks";

const defaultValues: CertificationInput = {
  name: "",
  issuer: "",
  issuedDate: "",
  url: "",
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toDateInput = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidUrl = (value?: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const CertificationsSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const addForm = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
    defaultValues,
    mode: "onChange",
  });

  const editForm = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
    defaultValues,
    mode: "onChange",
  });

  const addMutation = useAddCertification({ setError: addForm.setError });
  const updateMutation = useUpdateCertification({ setError: editForm.setError });
  const deleteMutation = useDeleteCertification();

  const certifications = profile?.certifications ?? [];

  const metaCountClass = useMemo(() => {
    if (certifications.length === 0) return "text-muted-foreground";
    if (certifications.length >= 2) return "text-primary";
    return "text-muted-foreground";
  }, [certifications.length]);

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
      name: item.name ?? "",
      issuer: item.issuer ?? "",
      issuedDate: toDateInput(item.issuedDate),
      url: item.url ?? "",
    });
  };

  const closeEditForm = () => {
    setEditingId(null);
    editForm.reset(defaultValues);
  };

  const handleAddSubmit = (values: CertificationInput) => {
    if (values.url && !isValidUrl(values.url)) {
      addForm.setError("url", { message: "Must be a valid URL" });
      toast.error("Please enter a valid URL");
      return;
    }

    addMutation.mutate(values, {
      onSuccess: () => closeAddForm(),
    });
  };

  const handleEditSubmit = (values: CertificationInput) => {
    if (!editingId) return;
    if (values.url && !isValidUrl(values.url)) {
      editForm.setError("url", { message: "Must be a valid URL" });
      toast.error("Please enter a valid URL");
      return;
    }

    updateMutation.mutate(
      { certId: editingId, data: values },
      { onSuccess: () => closeEditForm() },
    );
  };

  const handleDelete = (certId: string) => {
    deleteMutation.mutate(certId, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading certifications...</span>
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
              Certifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Highlight credentials that validate your expertise.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${metaCountClass}`}>
              {certifications.length} credentials
            </span>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              + Add Certification
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="rounded-2xl border border-primary/40 bg-background/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Add Certification
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
                    Certification Name
                  </label>
                  <input
                    type="text"
                    {...addForm.register("name")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="AWS Certified Solutions Architect"
                  />
                  {addForm.formState.errors.name?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {addForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Issuer
                  </label>
                  <input
                    type="text"
                    {...addForm.register("issuer")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Issued Date
                  </label>
                  <input
                    type="date"
                    {...addForm.register("issuedDate")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    {...addForm.register("url")}
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="https://"
                  />
                  {addForm.formState.errors.url?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {addForm.formState.errors.url.message}
                    </p>
                  )}
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
                  {addMutation.isPending ? "Saving..." : "Save Certification"}
                </button>
              </div>
            </form>
          </div>
        )}

        {certifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              List your professional certifications
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add credentials that help you stand out.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Add Certification
            </button>
          </div>
        ) : (
          <div className="relative space-y-6 pl-8">
            <div className="absolute left-3 top-2 h-full w-px bg-border/60" />
            {certifications.map((item: any) => (
              <div key={item._id} className="relative">
                <span className="absolute -left-[21px] top-6 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.name}
                      </h3>
                      {item.issuer && (
                        <p className="text-sm font-medium text-primary">
                          {item.issuer}
                        </p>
                      )}
                      {item.issuedDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(item.issuedDate)}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-semibold text-primary hover:text-primary/80"
                        >
                          View Credential
                        </a>
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
                        Edit Certification
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
                            Certification Name
                          </label>
                          <input
                            type="text"
                            {...editForm.register("name")}
                            className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          {editForm.formState.errors.name?.message && (
                            <p className="mt-2 text-xs text-status-error">
                              {editForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Issuer
                          </label>
                          <input
                            type="text"
                            {...editForm.register("issuer")}
                            className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Issued Date
                          </label>
                          <input
                            type="date"
                            {...editForm.register("issuedDate")}
                            className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Credential URL
                          </label>
                          <input
                            type="url"
                            {...editForm.register("url")}
                            className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          {editForm.formState.errors.url?.message && (
                            <p className="mt-2 text-xs text-status-error">
                              {editForm.formState.errors.url.message}
                            </p>
                          )}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CertificationsSection;
