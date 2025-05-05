
import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Use flex-col and justify-center to center vertically
    // items-center centers horizontally
    // Added relative and overflow-hidden for background image
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
       {/* Background Image */}
       <Image
         src="https://picsum.photos/seed/auth-background/1920/1080"
         alt="Abstract background"
         layout="fill"
         objectFit="cover"
         className="absolute inset-0 z-0 opacity-10" // Subtle opacity
         data-ai-hint="abstract texture dark elegant"
         priority // Load image early
       />
       {/* Content needs relative positioning to appear above background */}
       <div className="relative z-10 flex items-center justify-center w-full">
         {children} {/* The Card component from the auth page will be centered here */}
       </div>
    </div>
  );
}
