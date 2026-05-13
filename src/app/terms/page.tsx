import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of use | fathom²ail",
  description: "Terms governing use of the fathom²ail web application.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of use">
      <p>
        These terms apply to your use of the fathom²ail web application (the
        &ldquo;Service&rdquo;). By signing in or using the Service, you agree to them. If you do
        not agree, do not use the Service.
      </p>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">The Service</h2>
        <p>
          fathom²ail provides a client interface to view a limited set of messages from your
          Google account using OAuth and the Gmail API, optional local caching in your browser,
          and optional encrypted storage of message payloads in a database you or the operator
          configures. Features may change; availability is not guaranteed.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Your account and Google</h2>
        <p>
          Access is provided through Google sign-in. You must comply with Google&rsquo;s terms
          and policies when using Gmail data. You may revoke the app&rsquo;s access at any time
          from your Google account security settings.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
        <p>
          You will not misuse the Service, attempt unauthorized access to systems or data of
          others, interfere with security controls, or use the Service in violation of law.
          The operator may suspend or restrict access for violations or operational reasons.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Disclaimers</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind, to the
          fullest extent permitted by law. The operator is not responsible for loss of data,
          incorrect display of messages, or issues arising from third parties such as Google
          or hosting providers.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Limitation of liability</h2>
        <p>
          To the extent permitted by law, the operator&rsquo;s total liability for claims
          relating to the Service is limited to the greater of zero or amounts you paid
          specifically for the Service in the twelve months before the claim. Some jurisdictions
          do not allow certain limitations; in those cases, the limitation applies to the maximum
          extent allowed.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Changes</h2>
        <p>
          These terms may be updated. Continued use after changes constitutes acceptance of the
          revised terms. Material changes will be reflected in the repository or deployment
          documentation where applicable.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p>
          For questions about these terms, contact the person or organization operating this
          deployment of fathom²ail.
        </p>
      </section>
      <p className="text-xs text-muted-foreground/80">
        Last updated: May 2026. This is a general-purpose template; have counsel review before
        relying on it for a production business.
      </p>
    </LegalPageLayout>
  );
}
