import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
       {/* Can add a background image or pattern here if desired */}
      {children}
    </div>
  );
}
