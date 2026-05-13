import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy & security | fathom²ail",
  description:
    "How fathom²ail handles authentication, caching, encryption, and data integrity.",
};

export default function PolicyPage() {
  return (
    <LegalPageLayout title="Privacy, security & data integrity">
      <p>
        This page describes how fathom²ail is designed to treat your data with care. It is
        accurate to the open-source application behavior; whoever deploys the Service is
        responsible for their infrastructure, logging, and compliance obligations.
      </p>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">What we access</h2>
        <p>
          Sign-in uses Google OAuth. The application requests read-only access to Gmail so it
          can list and read message content needed for the inbox view. OAuth tokens are handled
          by NextAuth.js and may be stored in an encrypted or signed session cookie and, when
          configured, in your Postgres database for continuity. Only the scopes requested at
          sign-in are used.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Data on your device</h2>
        <p>
          After a successful fetch, message summaries used by the UI may be written to
          browser localStorage under a key scoped to your signed-in email. That data stays on
          your machine unless you clear site data or another program on your device reads it.
          You should protect device access and disk encryption like any sensitive workstation.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Optional cloud vault</h2>
        <p>
          If you use cloud sync, message payloads are serialized and encrypted on the server
          using AES-256-GCM with a key derived from environment secrets (for example
          MAIL_ENCRYPTION_KEY or AUTH_SECRET). The database stores ciphertext, not plaintext
          mail bodies. This protects data from casual database inspection and backup leaks
          where the key is not exposed.
        </p>
        <p>
          Application-level encryption is not the same as end-to-end encryption to another user:
          anyone who controls both the live database and the deployment secrets used for
          encryption can decrypt vault rows. Keep DATABASE_URL, AUTH_SECRET, and
          MAIL_ENCRYPTION_KEY restricted, rotate them on incident, and use TLS for all connections.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Integrity and transport</h2>
        <p>
          Traffic between your browser and the deployed app should use HTTPS so tokens and
          payloads are not exposed on the network. Gmail API calls from the server use
          Google&rsquo;s TLS endpoints. Database drivers should use encrypted connections when
          the provider supports them (for example Neon).
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Retention and deletion</h2>
        <p>
          Cached browser data can be removed by clearing storage for this origin. Vault rows
          and user rows in Postgres are deleted according to your operator&rsquo;s retention
          policy and SQL migrations; the application does not guarantee automatic deletion of
          cloud copies when you disconnect Google&mdash;configure lifecycle rules as needed.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">No sale of personal mail</h2>
        <p>
          The open-source application does not include analytics SDKs that exfiltrate mail
          content to advertisers. A deployer could still add logging or middleware; evaluate
          your hosting provider&rsquo;s privacy policy separately.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Your responsibilities</h2>
        <p>
          Use strong secrets in production, restrict database and admin access, patch
          dependencies, and monitor for abuse. Voice search uses the browser microphone only
          when you trigger it; grant permission mindfully.
        </p>
      </section>
      <p className="text-xs text-muted-foreground/80">
        Last updated: May 2026. This document is informational and not legal advice.
      </p>
    </LegalPageLayout>
  );
}
