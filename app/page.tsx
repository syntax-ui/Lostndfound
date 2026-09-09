import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">School Lost & Found</h1>
        <p className="text-xl mb-8 opacity-90">Find your lost items or help reunite people with theirs</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/student"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            I Lost Something
          </Link>
          <Link
            href="/login"
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition border border-white"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}
