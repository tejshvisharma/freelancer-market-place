import React, { useRef, useState } from "react";
import { toast } from "sonner"
import {
  useFreelancerProfile,
  useUploadResume,
} from "@/features/freelancer/hooks";

export const ResumeSection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadResume = useUploadResume({
    onSuccess: () => {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF and DOC/DOCX files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("resume", selectedFile);
    uploadResume.mutate(formData);
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading resume data...</span>
        </div>
      </div>
    );
  }

  const resumeUrl = profile?.resumeUrl;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-8">
        <header className="space-y-1 border-b border-border pb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Resume
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload your latest resume to stand out to clients. PDF, DOC, DOCX — max 10MB.
          </p>
        </header>

        {resumeUrl ? (
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                  <span className="material-symbols-outlined text-[28px]">
                    description
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg truncate max-w-[200px] sm:max-w-xs">
                    Current Resume
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 text-status-success">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Download
                </a>
                <button
                  onClick={handleReplaceClick}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    find_replace
                  </span>
                  Replace
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4 text-muted-foreground">
              <span className="material-symbols-outlined text-primary text-[18px]">
                visibility
              </span>
              <p className="text-sm">
                Your resume is visible to clients who view your profile.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center transition hover:border-primary/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <span className="material-symbols-outlined text-[24px]">
                upload_file
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Upload your resume
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Choose a file or drag and drop it here. PDF or DOC/DOCX up to 10MB.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Select File
            </button>
          </div>
        )}

        {/* Hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />

        {/* Upload Staging Area (When file is selected but not yet uploaded) */}
        {selectedFile && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined text-primary">
                  draft
                </span>
                <div className="truncate">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-muted-foreground hover:text-status-error transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadResume.isPending}
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploadResume.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
