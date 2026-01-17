'use client';

import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: Props) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      <input
        {...props}
        className={`w-full border rounded p-2 ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
