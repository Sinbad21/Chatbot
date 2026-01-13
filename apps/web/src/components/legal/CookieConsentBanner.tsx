'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const CONSENT_COOKIE = 'cookie_consent';

type ConsentValue = 'accepted' | 'essential';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function setCookie(name: string, value: string, maxAgeDays: number) {
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const value = getCookie(CONSENT_COOKIE) as ConsentValue | null;
    setVisible(!value);
  }, []);

  const acceptAll = () => {
    setCookie(CONSENT_COOKIE, 'accepted', 180);
    setVisible(false);
  };

  const essentialOnly = () => {
    setCookie(CONSENT_COOKIE, 'essential', 180);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto max-w-4xl rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Cookie notice.</span>{' '}
            We use essential cookies for authentication and security. Optional cookies (analytics) are only used with your consent.
            {' '}
            <Link href="/legal/cookies" className="underline underline-offset-4 hover:text-foreground">
              Cookie Policy
            </Link>{' '}
            {' '}
            <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={essentialOnly}>
              Essential only
            </Button>
            <Button onClick={acceptAll}>Accept all</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
