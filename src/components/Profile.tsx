'use client';

import Image from 'next/image';
import {
  BadgeCheckIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from 'lucide-react';
import type { UserProfile } from '@/app/api/_db/profile';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5 border-b border-black/5 py-2.5 last:border-0 sm:py-3">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:text-xs">
        {label}
      </dt>
      <dd
        className={`text-xs text-black sm:text-sm ${mono ? 'break-all font-mono text-[11px] sm:text-xs' : 'wrap-break-word'}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function Profile({ profile }: { profile: UserProfile }) {
  const scopeList = profile.scopes
    ? profile.scopes.split(/[\s,]+/).filter(Boolean)
    : [];

  return (
    <div className="min-h-0 text-black">
      <main className="mx-auto max-w-lg px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-4 space-y-1 sm:mb-6">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Your profile</h1>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Account details from your sign-in. This information is read-only and cannot be edited here.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-black/10 p-3 sm:gap-4 sm:p-4">
            {profile.image ? (
              <Image
                src={profile.image}
                alt=""
                width={48}
                height={48}
                className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 sm:h-12 sm:w-12">
                <UserIcon className="h-5 w-5 text-zinc-400 sm:h-6 sm:w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base">{profile.name}</p>
              <p className="truncate text-xs text-zinc-500 sm:text-sm">{profile.email}</p>
              {profile.emailVerified && (
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-green-700 sm:text-xs">
                  <BadgeCheckIcon className="h-3 w-3" />
                  Verified email
                </span>
              )}
            </div>
          </div>

          <dl className="divide-y divide-black/5 px-3 sm:px-4">
            <Field label="Display name" value={profile.name} />
            <Field label="Email" value={profile.email} />
            <Field label="User ID" value={profile.id} mono />
            <Field label="Signed up" value={formatDate(profile.authCreatedAt)} />
            {profile.appCreatedAt && (
              <Field label="App record created" value={formatDate(profile.appCreatedAt)} />
            )}
            <Field
              label="Encrypted mails stored"
              value={String(profile.totalEncryptedMails)}
            />
          </dl>
        </section>

        <section className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:mt-4">
          <div className="border-b border-black/10 px-3 py-2 sm:px-4 sm:py-2.5">
            <h2 className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
              <ShieldIcon className="h-3.5 w-3.5 text-zinc-400" />
              Sign-in &amp; access
            </h2>
          </div>
          <dl className="px-3 sm:px-4">
            <Field
              label="Provider"
              value={profile.provider ? profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1) : '—'}
            />
            {profile.providerAccountId && (
              <Field label="Provider account ID" value={profile.providerAccountId} mono />
            )}
            <Field label="Linked" value={formatDate(profile.providerLinkedAt)} />
            {scopeList.length > 0 ? (
              <div className="space-y-1.5 border-b border-black/5 py-2.5 last:border-0 sm:py-3">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:text-xs">
                  Permissions
                </dt>
                <dd className="flex flex-wrap gap-1">
                  {scopeList.map((scope) => (
                    <span
                      key={scope}
                      className="inline-block max-w-full truncate rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-zinc-700 sm:text-[10px]"
                    >
                      {scope}
                    </span>
                  ))}
                </dd>
              </div>
            ) : (
              <Field label="Permissions" value="—" />
            )}
          </dl>
        </section>

        <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-zinc-400 sm:text-xs">
          Profile data is tied to your Google account and Firemail records.
        </p>
      </main>
    </div>
  );
}
