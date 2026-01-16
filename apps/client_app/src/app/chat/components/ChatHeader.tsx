'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatHeader() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
      <div className="max-w-[935px] mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 rounded hover:bg-gray-100" aria-label="Back" type="button">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Link href="/feed" className="block">
          <h1 className="text-2xl md:text-3xl font-serif italic cursor-pointer">Instagram</h1>
        </Link>
        <div className="w-6 h-6" />
      </div>
    </header>
  );
}
