'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck } from './icons';

const MAX_MESSAGE_LENGTH = 5000; // the inbox rejects anything longer

type Status = 'idle' | 'success' | 'error' | 'offline';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const confirmation = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so it is read out, and so the keyboard isn't left on a button that has gone
  useEffect(() => {
    if (status === 'success') confirmation.current?.focus();
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if honeypot is filled
    if (company) {
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    let response: Response;
    try {
      response = await fetch('https://mail.probablyfinestudios.com/api/public/messages', {
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
    } catch (error) {
      // The request never got an answer: no connection, or the server is unreachable
      console.error('Submission error:', error);
      setStatus('offline');
      setIsSubmitting(false);
      return;
    }

    try {
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

  if (status === 'success') {
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        role="status"
        className="animate-rise rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center outline-none sm:px-10"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
          <IconCheck className="h-6 w-6" strokeWidth={2} />
        </span>
        <h2 className="mt-6 font-display text-3xl font-light text-white">Sent.</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-neutral-300">I’ll get back to you by email. Cheers!</p>
        <button type="button" onClick={() => setStatus('idle')} className="text-link mt-8 text-sm">
          Send another
        </button>
      </div>
    );
  }

  const remaining = MAX_MESSAGE_LENGTH - message.length;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-neutral-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className="field"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-neutral-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="field"
          />
        </div>

        <div className="sm:col-span-2">
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor="message" className="block text-sm text-neutral-300">
              Message
            </label>
            {remaining <= 500 && (
              <span className="text-xs tabular-nums text-neutral-400" aria-live="polite">
                {remaining} characters left
              </span>
            )}
          </div>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={7}
            maxLength={MAX_MESSAGE_LENGTH}
            className="field resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Honeypot field - visually hidden */}
      <div className="hidden" aria-hidden="true">
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

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={isSubmitting} className="button-primary">
          {isSubmitting ? 'Sending…' : 'Send it'}
        </button>
        <p role="status" aria-live="polite" className={`text-sm ${status === 'idle' ? 'text-neutral-400' : 'text-rose-300'}`}>
          {status === 'error' && 'That didn’t send. Give it another go in a minute.'}
          {status === 'offline' && 'Couldn’t reach the server. Check your connection and try again.'}
          {status === 'idle' && 'Goes straight to my inbox. No robots in between.'}
        </p>
      </div>
    </form>
  );
}
