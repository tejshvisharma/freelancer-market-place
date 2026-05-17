import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import {
  portfolioItemSchema,
  type PortfolioItemInput,
} from "@/features/freelancer/schemas/freelancer.schema";
import {
  useAddPortfolioItem,
  useDeletePortfolioItem,
  useFreelancerProfile,
} from "@/features/freelancer/hooks";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const defaultValues: PortfolioItemInput = {
  title: "",
  description: "",
  link: "",
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const PortfolioSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<PortfolioItemInput>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues,
    mode: "onChange",
  });

  const closePanel = () => {
    setIsOpen(false);
    form.reset(defaultValues);
    setSelectedFile(null);
  };

  const addMutation = useAddPortfolioItem({
    onSuccess: closePanel,
  });
  const deleteMutation = useDeletePortfolioItem();

  const portfolioItems = profile?.portfolio ?? [];
  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables as string | undefined)
    : undefined;

  const skillCountClass = useMemo(() => {
    if (portfolioItems.length === 0) return "text-muted-foreground";
    if (portfolioItems.length >= 6) return "text-primary";
    return "text-muted-foreground";
  }, [portfolioItems.length]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (file?: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const validateFile = (file: File | null) => {
    if (!file) {
      toast.error("Please select an image");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 5MB");
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, GIF, SVG allowed");
      return false;
    }
    return true;
  };

  const handleSubmit = (values: PortfolioItemInput) => {
    if (!validateFile(selectedFile)) return;
    addMutation.mutate({
      file: selectedFile as File,
      title: values.title,
      description: values.description || undefined,
      link: values.link || undefined,
    });
  };

  const handleDelete = (itemId: string) => {
    const confirmed = window.confirm("Remove this portfolio item?");
    if (!confirmed) return;
    deleteMutation.mutate(itemId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading portfolio...</span>
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
              Portfolio
            </h2>
            <p className="text-sm text-muted-foreground">
              Curate your best work to build trust and attract the right clients.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${skillCountClass}`}>
              {portfolioItems.length} projects
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-xs font-semibold text-background transition hover:bg-foreground/90"
            >
              + Add Project
            </button>
          </div>
        </header>

        {portfolioItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No portfolio projects yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a project preview to start building trust with clients.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {portfolioItems.map((item) => (
              <div
                key={item._id}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm transition hover:border-primary/40"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-80" />
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteMutation.isPending && deletingId === item._id}
                    className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition hover:text-status-error disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleteMutation.isPending && deletingId === item._id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-primary hover:text-primary/80"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-background/60 px-6 py-10 text-center transition hover:border-primary/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <span className="text-lg">+</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Add New Project
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload images and details
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border/70 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/70 px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">
                Add New Project
              </h3>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
              >
                x
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-1 flex-col gap-6 overflow-y-auto p-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Project Thumbnail
                </label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openFilePicker}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-background/70 px-6 text-center text-sm text-muted-foreground transition hover:border-primary/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0] || null)
                    }
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-lg">+</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold text-primary">Click to upload</span>{" "}
                      or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      SVG, PNG, JPG, WebP, or GIF (max 5MB)
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-foreground">
                      <span>{selectedFile.name}</span>
                      <span className="text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-muted-foreground hover:text-status-error"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Project Title
                  </label>
                  <input
                    type="text"
                    {...form.register("title")}
                    placeholder="e.g. E-Commerce Redesign"
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {form.formState.errors.title?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Live URL (Optional)
                  </label>
                  <input
                    type="url"
                    {...form.register("link")}
                    placeholder="https://"
                    className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {form.formState.errors.link?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {form.formState.errors.link.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    {...form.register("description")}
                    placeholder="Briefly describe the project, your role, and the outcome..."
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {form.formState.errors.description?.message && (
                    <p className="mt-2 text-xs text-status-error">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-end gap-3 border-t border-border/70 pt-4">
                <button
                  type="button"
                  onClick={closePanel}
                  className="h-10 rounded-full border border-border bg-transparent px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {addMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
