'use client';

import Link from 'next/link';
import { useTheme } from './providers';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-4 py-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-white rounded-lg font-medium hover:opacity-90 transition"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">School Lost & Found</h1>
        <p className="text-xl mb-8 opacity-90">Find your lost items or help reunite people with theirs</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/student"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
          >
            I Lost Something
          </Link>
          <Link
            href="/login"
            className="bg-blue-700 dark:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 dark:hover:bg-gray-600 transition border border-white"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}
  
