'use client';

import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: Props) {
  const base = 'px-4 py-2 rounded font-medium transition';
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'border hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    />
  );
}
