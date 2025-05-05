'use client';

import * as React from 'react';

// Placeholder for potential site-wide context (e.g., theme, auth state)
interface SiteContextProps {
  // Define context properties here if needed in the future
}

const SiteContext = React.createContext<SiteContextProps | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  // Add state and logic here if needed
  const contextValue = {
    // Provide context values
  };

  return (
    <SiteContext.Provider value={contextValue}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  const context = React.useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider');
  }
  return context;
}
