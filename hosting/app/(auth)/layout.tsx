
import React from 'react';
// Removed Image import as it's handled globally

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removed relative and overflow-hidden as BackgroundImage handles this
    // Use flex-col and justify-center to center vertically
    // items-center centers horizontally
    <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
       {/* Background Image is now handled by the global BackgroundImage component */}

       {/* Content needs relative positioning only if it needs to stack above other relative items,
           but since the background is handled outside, this might not be needed,
           or z-index can be handled within the BackgroundImage context.
           Keeping z-10 just in case, but removed relative initially.
       */}
       <div className="z-10 flex items-center justify-center w-full">
         {children} {/* The Card component from the auth page will be centered here */}
       </div>
    </div>
  );
}

    