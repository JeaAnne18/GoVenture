import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
};

export default function Field({ label, hint, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId}>{label}</label>
        {hint}
      </div>
      <input
        id={inputId}
        {...props}
        className="min-h-11 rounded-[14px] border border-[#D9D6E6] px-3.5 text-[15px] text-[#2B2D33] outline-none focus:border-[#0F5E66] focus:ring-2 focus:ring-[#0F5E66]/20"
      />
    </div>
  );
}