import Link from 'next/link'
import { FiMenu, FiX } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/store', label: 'Store' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' }
] as const

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-40 neo-blur neo-gradient"></div>
      <nav className={`fixed top-3 right-4 z-50 transition-all duration-500`}>
        <button
          className="neo-blur p-5 rounded-2xl hover:scale-105 
                   transition-all duration-300 active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FiX size={28} className="text-white" />
          ) : (
            <FiMenu size={28} className="text-white" />
          )}
        </button>

        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-700 
            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={`absolute right-0 top-0 h-full w-[min(100vw,420px)] 
              neo-gradient neo-blur transform transition-transform duration-700
              ease-[cubic-bezier(.17,.67,.83,.67)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-8 pt-32 pb-8 space-y-4">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-6 py-5 rounded-2xl text-lg font-light tracking-wide 
                    transition-all duration-300 ${
                      router.pathname === href
                        ? 'neo-gradient text-white neo-glow'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
