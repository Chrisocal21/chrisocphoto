"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed] flex flex-col items-center justify-center p-8 sm:p-20 gap-12">
      <header className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to My Custom Next.js App
        </h1>
        <p className="text-lg">
          Edit{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            src/app/page.tsx
          </code>{" "}
          to update this page.
        </p>
        <Link href="/about">
          <a className="text-blue-500 hover:underline">Go to About Page</a>
        </Link>
      </header>

      <main className="flex flex-col items-center gap-8">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
          className="dark:invert"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Deploy Now
          </a>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Read the Docs
          </a>
        </div>
      </main>

      <footer className="flex flex-wrap items-center gap-6 justify-center">
        <a
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <Image src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <Image src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Next.js Official Site →
        </a>
      </footer>
    </div>
  );
}