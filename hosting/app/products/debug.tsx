"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  // Basic state for testing client-side reactivity
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<Record<string, any>>({});

  // Effect to verify client-side execution
  useEffect(() => {
    console.log("Debug component mounted on client-side");
    setMounted(true);

    // Collect browser environment information
    setBrowserInfo({
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: new Date().toISOString(),
    });

    // Test localStorage
    try {
      localStorage.setItem('debug-test', 'works');
      const testValue = localStorage.getItem('debug-test');
      setBrowserInfo(prev => ({ ...prev, localStorage: testValue === 'works' ? 'working' : 'failed' }));
    } catch (e) {
      setBrowserInfo(prev => ({ ...prev, localStorage: 'error', localStorageError: String(e) }));
    }
  }, []);

  const incrementCounter = () => {
    setCount(prevCount => prevCount + 1);
    console.log("Incremented counter to:", count + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Client-Side Rendering Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>State Management Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-lg mb-4">Counter: <span className="font-bold">{count}</span></p>
              <Button onClick={incrementCounter}>Increment Counter</Button>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p>Client Hydration Status: <span className="font-semibold">{mounted ? "✅ Component Mounted" : "❌ Not Mounted"}</span></p>
              <p className="text-sm text-muted-foreground">
                This text should update after hydration completes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Browser Details:</h3>
              {mounted ? (
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(browserInfo, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground italic">Loading browser information...</p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Rendering Test:</h3>
              <p>
                Page was initially rendered at: {new Date().toISOString()}
              </p>
              {mounted && (
                <p className="mt-2 text-green-600">
                  ✅ Client-side code is executing successfully!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Next Steps</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>If this page renders correctly but product configuration pages don't, there may be specific issues with those components.</li>
          <li>Check for JavaScript errors in the browser console on the problem pages.</li>
          <li>Verify that all dependencies are properly loaded (images, styles, scripts).</li>
          <li>Test with different browsers to rule out browser-specific issues.</li>
        </ul>
      </div>
    </div>
  );
}

