'use client';

import { useState } from 'react';
import Menu from '../components/Menu';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if honeypot is filled
    if (company) {
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('https://mail.probablyfinestudios.com/api/public/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_site: 'chrisocphoto',
          name,
          email,
          message,
          company: '',
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Request failed.');
      }

      // Success
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f14]">
      <Menu />
      
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/Logo-Vertical.png" 
                alt="ChrisOCPhoto" 
                className="w-32 opacity-90"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.1) contrast(1.05)' }}
              />
            </div>

            <h1 className="text-2xl font-light text-white/90 mb-8 text-center">Get in touch</h1>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-600/50 rounded text-green-300 text-sm">
                Thanks for reaching out! I'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded text-red-300 text-sm">
                Something went wrong. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-white/75 text-sm mb-2 font-light">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white/90 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white/75 text-sm mb-2 font-light">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white/90 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white/75 text-sm mb-2 font-light">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white/90 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {/* Honeypot field - visually hidden */}
              <div className="hidden">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-white/10 hover:bg-white/15 disabled:bg-white/5 border border-white/20 rounded text-white/90 text-sm font-light transition-colors disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
