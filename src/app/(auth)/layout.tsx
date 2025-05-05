
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Use flex-col and justify-center to center vertically
    // items-center centers horizontally
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
       {/* The Card component from the auth page will be centered here */}
      {children}
    </div>
  );
}
