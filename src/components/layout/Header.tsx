'use client';

import { Bell } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={18} />
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
          EM
        </div>
      </div>
    </header>
  );
}
