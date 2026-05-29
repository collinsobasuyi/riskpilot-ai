"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs text-slate-400">{children}</p>;
}

const fieldBase =
  "w-full rounded-sm border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors";
const fieldNormal =
  "border-slate-300 bg-white focus:border-blue-700 focus:ring-blue-700";
const fieldError =
  "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500";

export function Select({
  name,
  value,
  onChange,
  children,
  error,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      >
        {children}
      </select>
      <FieldError msg={error} />
    </>
  );
}

export function TextInput({
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      />
      <FieldError msg={error} />
    </>
  );
}

export function Textarea({
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      />
      <FieldError msg={error} />
    </>
  );
}

export function CheckboxGroup({
  name,
  options,
  selected,
  onChange,
}: {
  name: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => onChange(opt)}
            className="accent-blue-700"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-start gap-2.5 rounded-sm border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-blue-700"
          />
          <div>
            <p className="text-sm font-medium text-slate-800">{opt.label}</p>
            {opt.hint && <p className="text-xs text-slate-500">{opt.hint}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}
