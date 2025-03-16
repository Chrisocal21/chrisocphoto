import { useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <>
      <div className="header"></div>
      <input 
        type="checkbox" 
        className="openSidebarMenu" 
        id="openSidebarMenu" 
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label>
      <div id="sidebarMenu">
        <ul className="sidebarMenuInner">
          <li>Chris OC Photography <span>Portfolio</span></li>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/portfolio">Portfolio</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>
    </>
  );
}
