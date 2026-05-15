'use client';

import { useState } from 'react';
import Loader from './Loader';

export default function Admin({
  sessionAdminId,
}: {
  sessionAdminId?: string | null;
}) {
  const [appLoading, setAppLoading] = useState(true);

  if (appLoading) {
    return <Loader message={"Authenticating"} onComplete={() => setAppLoading(false)} />;
  }

  return (
    <div className="min-h-0 bg-background text-foreground p-3 selection:bg-accent/30 selection:text-white sm:p-8 lg:p-12">Admin {sessionAdminId}</div>
  );
}
