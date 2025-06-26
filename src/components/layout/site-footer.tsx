import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="w-full bg-amber-900 text-amber-50 py-6 relative z-10">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-sm mb-1">
          &copy; {new Date().getFullYear()} Oak Structures. All rights reserved.
        </p>
        <div className="flex items-center space-x-3">
          <Link href="/privacy-policy" className="text-sm hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
