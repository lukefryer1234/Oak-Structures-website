"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddressesTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Address Test Page</h1>
      <p className="mt-4">This is a test page to diagnose routing issues.</p>

      <div className="mt-8 space-y-4">
        <p>
          Current URL path:{" "}
          {typeof window !== "undefined" ? window.location.pathname : "Unknown"}
        </p>

        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/account/addresses">
              Go to Addresses Page (Link component)
            </Link>
          </Button>

          <Button onClick={() => (window.location.href = "/account/addresses")}>
            Go to Addresses Page (window.location)
          </Button>

          <Button asChild variant="outline">
            <Link href="/account/profile">Go to Profile Page</Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log("Browser info:", navigator.userAgent)}
          >
            Log Browser Info
          </Button>
        </div>
      </div>
    </div>
  );
}
