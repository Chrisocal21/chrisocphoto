import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';
import NavBar from './NavBar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'ChrisOC Photography' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Professional photography portfolio by Chris OC" />
      </Head>
      
      <NavBar />
      
      <main className="min-h-screen bg-black">
        {children}
      </main>
      
      <footer className="py-8 text-center text-white/60">
        <div className="container mx-auto">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Chris OC Photography. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/" className="text-white/60 hover:text-white">Home</Link>
            <Link href="/portfolio" className="text-white/60 hover:text-white">Portfolio</Link>
            <Link href="/about" className="text-white/60 hover:text-white">About</Link>
            <Link href="/contact" className="text-white/60 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
