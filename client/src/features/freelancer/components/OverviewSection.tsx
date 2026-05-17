import { useAuthStore } from "@/stores/auth.store";
import {
  useFreelancerProfile,
  useRecalculateScore,
} from "@/features/freelancer/hooks";

export const OverviewSection = () => {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useFreelancerProfile();
  const recalculateScore = useRecalculateScore();

  if (isLoading || !profile || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading profile overview...</span>
        </div>
      </div>
    );
  }

  const score = profile.profileCompletionScore || 0;
  const RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  let strokeColor = "hsl(var(--success, 142 71% 45%))";
  if (score < 40) {
    strokeColor = "hsl(var(--destructive, 0 76% 57%))";
  } else if (score < 70) {
    strokeColor = "#F59E0B";
  }

  const completionItems = [
    {
      key: "headline",
      label: "Headline",
      complete: !!profile.headline,
      hint: "Appear in more searches",
    },
    {
      key: "bio",
      label: "Professional Bio",
      complete: !!profile.bio,
      hint: "Build client trust",
    },
    {
      key: "skills",
      label: "Skills",
      complete: profile.skills && profile.skills.length > 0,
      hint: "Appear in skill-based searches",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      complete: profile.portfolio && profile.portfolio.length > 0,
      hint: "Show your best work",
    },
    {
      key: "experience",
      label: "Work Experience",
      complete: profile.workExperience && profile.workExperience.length > 0,
      hint: "Build credibility",
    },
    {
      key: "pricing",
      label: "Pricing",
      complete: !!profile.pricing?.hourlyRate,
      hint: "Receive relevant invitations",
    },
    {
      key: "availability",
      label: "Availability",
      complete: profile.availability && profile.availability.length > 0,
      hint: "Let clients know when to reach you",
    },
    {
      key: "resume",
      label: "Resume",
      complete: !!profile.resumeUrl,
      hint: "Stand out to clients",
    },
  ];

  const missingItems = completionItems.filter((item) => !item.complete);

  const handleRecalculate = () => {
    recalculateScore.mutate();
  };

  const handleViewPublicProfile = () => {
    window.open(`/freelancer/${user._id}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
          <div className="relative shrink-0">
            <div className="w-[96px] h-[96px] rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-muted-foreground">
                  person
                </span>
              )}
            </div>
            {profile.isVerified && (
              <div
                className="absolute bottom-0 right-0 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center"
                title="Verified"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">
                  verified
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-[24px] font-bold text-foreground font-display">
                {user.name}
              </h2>
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[11px] font-semibold text-primary tracking-wide uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-[18px] font-semibold text-muted-foreground">
              {profile.headline || "No headline set"}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  email
                </span>
                {user.email}
              </div>
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex items-center gap-2 border-l border-border pl-4">
                  {profile.badges.map((badge: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion Ring */}
        <div className="flex flex-col items-center gap-3 z-10 shrink-0 mt-6 md:mt-0">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 absolute top-0 left-0"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                fill="none"
                r={RADIUS}
                className="stroke-muted"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                fill="none"
                r={RADIUS}
                stroke={strokeColor}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth="8"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center absolute inset-0 flex items-center justify-center">
              <span className="text-[20px] font-bold text-foreground font-display">
                {score}%
              </span>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Profile Strength
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "account_balance_wallet",
            label: "Total Earnings",
            value: `$${profile.totalEarnings?.toLocaleString() || "0"}`,
          },
          {
            icon: "task_alt",
            label: "Completed Jobs",
            value: profile.completedJobs || 0,
          },
          {
            icon: "star",
            label: "Avg Rating",
            value: profile.avgRating?.toFixed(1) || "0.0",
            suffix: (
              <span
                className="material-symbols-outlined text-[16px] text-status-warning"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ),
          },
          {
            icon: "reviews",
            label: "Total Reviews",
            value: profile.totalReviews || 0,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary/30 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-[24px]">
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold text-foreground font-display">
                  {stat.value}
                </span>
                {stat.suffix}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                fact_check
              </span>
              What's Missing
            </h3>
            {missingItems.length > 0 && (
              <span className="text-[11px] font-semibold bg-muted border border-border px-2 py-1 rounded text-muted-foreground uppercase tracking-wide">
                {missingItems.length} Task{missingItems.length !== 1 ? "s" : ""}{" "}
                Left
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {missingItems.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px] text-status-success mb-2">
                  celebration
                </span>
                <p className="text-lg font-medium text-foreground">
                  Your profile is complete! 🎉
                </p>
                <p className="text-sm text-muted-foreground">
                  You've filled out all recommended sections.
                </p>
              </div>
            ) : (
              missingItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg hover:border-primary/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded border-2 border-border flex items-center justify-center group-hover:border-primary transition-colors" />
                    <div>
                      <p className="text-[13px] font-medium text-foreground mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleViewPublicProfile}
              className="w-full h-9 bg-primary text-primary-foreground font-medium text-[13px] rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                visibility
              </span>
              View Public Profile
            </button>
            <button
              onClick={handleRecalculate}
              disabled={recalculateScore.isPending}
              className="w-full h-9 bg-transparent border border-border text-foreground font-medium text-[13px] rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  recalculateScore.isPending ? "animate-spin" : ""
                }`}
              >
                {recalculateScore.isPending ? "sync" : "calculate"}
              </span>
              {recalculateScore.isPending
                ? "Calculating..."
                : "Recalculate Score"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
