import { useId } from "react";

export function Input({ label, error, helperText, className = "", id: customId, ...props }) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label htmlFor={inputId} className="field-label block text-xs font-semibold text-gray-700 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-[11px] text-red-600 font-medium mt-1 block">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-[10px] text-gray-400 mt-1 block">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
