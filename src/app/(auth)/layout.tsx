import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
       {/* The Card component from login/register pages will be centered here */}
      {children}
    </div>
  );
}
