import React from "react";

interface WorkflowStepProps {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  verdictText?: string;
  beginnerBullets?: string[];
  isActive?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

export default function WorkflowStep({
  icon: Icon,
  title,
  subtitle,
  verdictText,
  beginnerBullets = [],
  isActive = false,
  isLast = false,
  children,
}: WorkflowStepProps) {
  return (
    <section
      className={`relative rounded-2xl border bg-white dark:bg-slate-900 shadow-sm ${
        isActive
          ? "border-blue-400/50"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="mt-1 text-blue-600 dark:text-blue-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Verdict */}
        {verdictText && (
          <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-700 dark:text-slate-300">
            <strong>Verdict:</strong> {verdictText}
          </div>
        )}

        {/* Beginner bullets */}
        {beginnerBullets.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            {beginnerBullets.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Footer line (visual only) */}
      {!isLast && (
        <div className="absolute left-1/2 -bottom-6 h-6 w-px bg-slate-300 dark:bg-slate-700" />
      )}
    </section>
  );
}
