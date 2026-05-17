import { useEffect, useState } from "react";
import { toast } from "sonner"
import {
  useFreelancerProfile,
  useUpdateAvailability,
} from "@/features/freelancer/hooks";
import type { DayOfWeek } from "@/features/freelancer/types/freelancer.types";

type DayConfig = {
  enabled: boolean;
  from: string; // "HH:mm"
  to: string; // "HH:mm"
};

const DEFAULT_HOURS = { from: "09:00", to: "17:00" };
const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export const AvailabilitySection = () => {
  const { data: profile, isLoading } = useFreelancerProfile();
  const updateAvailability = useUpdateAvailability();

  const [schedule, setSchedule] = useState<Record<DayOfWeek, DayConfig>>({
    Mon: { enabled: false, ...DEFAULT_HOURS },
    Tue: { enabled: false, ...DEFAULT_HOURS },
    Wed: { enabled: false, ...DEFAULT_HOURS },
    Thu: { enabled: false, ...DEFAULT_HOURS },
    Fri: { enabled: false, ...DEFAULT_HOURS },
    Sat: { enabled: false, ...DEFAULT_HOURS },
    Sun: { enabled: false, ...DEFAULT_HOURS },
  });

  const [hasEmptyAvailability, setHasEmptyAvailability] = useState(false);

  useEffect(() => {
    if (!profile) return;
    
    if (!profile.availability || profile.availability.length === 0) {
      setHasEmptyAvailability(true);
    } else {
      setHasEmptyAvailability(false);
    }

    setSchedule((prev) => {
      const next = { ...prev };
      // Reset all to default/disabled first in case profile updates externally
      DAYS.forEach((d) => {
        next[d] = { enabled: false, ...DEFAULT_HOURS };
      });
      
      profile.availability?.forEach((slot) => {
        next[slot.day] = { enabled: true, from: slot.from, to: slot.to };
      });
      return next;
    });
  }, [profile?.availability]);

  const toggleDay = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        from: !prev[day].enabled ? DEFAULT_HOURS.from : prev[day].from,
        to: !prev[day].enabled ? DEFAULT_HOURS.to : prev[day].to,
      },
    }));
  };

  const updateTime = (
    day: DayOfWeek,
    field: "from" | "to",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const enabledDays = DAYS.filter((d) => schedule[d].enabled);

    if (enabledDays.length === 0) {
      toast.error("Enable at least one day");
      return;
    }

    for (const day of enabledDays) {
      const { from, to } = schedule[day];
      const [fromH, fromM] = from.split(":").map(Number);
      const [toH, toM] = to.split(":").map(Number);
      
      const fromMinutes = fromH * 60 + fromM;
      const toMinutes = toH * 60 + toM;

      if (toMinutes <= fromMinutes) {
        toast.error(`End time must be after start time for ${day}`);
        return;
      }
    }

    const slots = enabledDays.map((d) => ({
      day: d,
      from: schedule[d].from,
      to: schedule[d].to,
    }));

    updateAvailability.mutate({ slots });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Loading availability...</span>
        </div>
      </div>
    );
  }



  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-8">
        <header className="space-y-1 border-b border-border pb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Availability
          </h2>
          <p className="text-sm text-muted-foreground">
            Define your standard working hours for potential clients.
          </p>
        </header>

        {hasEmptyAvailability && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
            Set your working hours so clients know when to reach you
          </div>
        )}

        <div className="rounded-xl border border-border bg-background p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            {DAYS.map((day) => {
              const { enabled, from, to } = schedule[day];

              return (
                <div
                  key={day}
                  className={`flex flex-col gap-3 p-4 rounded-xl border transition-colors ${
                    enabled
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        enabled ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        onChange={() => toggleDay(day)}
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {enabled ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          From
                        </label>
                        <select
                          value={from}
                          onChange={(e) => updateTime(day, "from", e.target.value)}
                          className="h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          To
                        </label>
                        <select
                          value={to}
                          onChange={(e) => updateTime(day, "to", e.target.value)}
                          className="h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[100px] items-center justify-center pt-2">
                      <span className="text-sm italic text-muted-foreground">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Active Days:
            </span>
            {DAYS.filter((d) => schedule[d].enabled).length > 0 ? (
              DAYS.filter((d) => schedule[d].enabled).map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {d}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">None</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateAvailability.isPending}
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {updateAvailability.isPending ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </section>
  );
};
