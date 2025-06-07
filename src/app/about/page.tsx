
// No Image or Separator needed for the new simpler structure
// import Image from 'next/image';
// import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | Oak Structures", // Updated title to reflect "Oak Structures"
  description: "Learn about Oak Structures, our mission, values, and commitment to quality craftsmanship in bespoke oak frame buildings and structures.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-3xl mx-auto bg-card/70 backdrop-blur-sm p-6 md:p-10 rounded-lg shadow-md border border-border/50">
        <article className="space-y-8"> {/* Using article for semantic content and space-y for paragraph spacing */}

          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              About Oak Structures
            </h1>
            <p className="mt-3 text-xl md:text-2xl text-muted-foreground">
              Your trusted partner for bespoke oak buildings and structures.
            </p>
          </header>

          <section>
            <p className="text-lg leading-relaxed text-foreground/90">
              At Oak Structures, we specialize in designing and constructing high-quality, sustainable oak frame buildings.
              Our passion for traditional craftsmanship, combined with modern design techniques, allows us to create stunning
              and durable structures tailored to your unique vision. From majestic oak garages and charming gazebos to welcoming
              porches and robust oak beams, every project is a testament to the timeless beauty and strength of oak.
              We are committed to using sustainably sourced timber and providing an exceptional service from concept to completion.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-4 border-b pb-2">Our Location</h2>
            <address className="not-italic text-lg leading-relaxed text-foreground/90 space-y-1">
              <p>Oak Structures Ltd.</p>
              <p>123 Timber Lane</p>
              <p>Oakwood Village</p>
              <p>Forestshire, UK</p>
              <p>WD1 2OK</p>
            </address>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-4 border-b pb-2">Contact Us</h2>
            <div className="text-lg leading-relaxed text-foreground/90 space-y-1">
              <p>
                Phone: <a href="tel:01234567890" className="text-primary hover:underline">01234 567890</a>
              </p>
              <p>
                Email: <a href="mailto:info@oakstructures.example.com" className="text-primary hover:underline">info@oakstructures.example.com</a>
              </p>
              <p className="mt-2">
                We are available Monday to Friday, 9:00 AM to 5:00 PM.
              </p>
            </div>
          </section>

          <section>
            <p className="text-lg leading-relaxed text-foreground/90">
              We are passionate about oak and dedicated to bringing your vision to life with structures that are not only
              functional but also inspire. Whether you are planning a new build, an extension, or looking for quality oak
              components, our team is here to guide you every step of the way.
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}