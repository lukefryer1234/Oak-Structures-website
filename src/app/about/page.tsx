
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Timberline Commerce, our mission, values, and commitment to quality craftsmanship in oak frame structures and timber products.",
};


export default function AboutPage() {
  return (
    // Removed relative isolate and background image handling
    <div>
        {/* Hero Section */}
        <div className="relative h-64 md:h-80">
            <Image
                src="https://picsum.photos/seed/about-hero/1200/400"
                alt="Timberline Commerce Workshop Interior"
                layout="fill"
                objectFit="cover"
                priority
                data-ai-hint="bright modern wood workshop interior tools machinery"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div> {/* Adjusted gradient */}
             <div className="absolute bottom-0 left-0 p-6 md:p-10 container mx-auto z-10"> {/* Ensure text is above gradient */}
                <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground drop-shadow-lg">About Timberline Commerce</h1>
             </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Add background, padding, etc. directly if needed, or let BackgroundImage handle it */}
          <div className="max-w-4xl mx-auto bg-card/70 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-md border border-border/50">
            {/* Using prose for readable text formatting, customized via globals.css or tailwind.config */}
            <div className="prose prose-lg lg:prose-xl max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
              <p className="lead text-xl text-muted-foreground !mb-8"> {/* Lead paragraph style */}
                Welcome to Timberline Commerce, your premier source for high-quality, bespoke oak frame structures and timber products in the UK. Founded on the principles of traditional craftsmanship and modern design, we specialize in creating beautiful and durable garages, gazebos, porches, beams, and flooring tailored to your exact specifications.
              </p>

              <p>
                Our team comprises experienced artisans and designers passionate about working with oak, a material renowned for its strength, longevity, and natural beauty. Whether you choose reclaimed, kilned dried, or green oak, we ensure every piece meets our rigorous standards for quality and sustainability. We meticulously select our timber and employ time-honoured jointing techniques, ensuring structures that are not only aesthetically pleasing but built to last for generations.
              </p>
              <p>
                We believe that building with natural materials connects us to our environment and heritage. That's why we are committed to responsible sourcing and practices that minimize our environmental impact throughout our supply chain.
              </p>

               {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10 not-prose"> {/* Escape prose for grid layout */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md bg-muted">
                      <Image
                          src="https://picsum.photos/seed/craftsmanship/600/450"
                          alt="Close up of oak joint craftsmanship"
                          layout="fill" objectFit="cover" data-ai-hint="oak wood traditional joinery close up detail"
                      />
                  </div>
                   <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md bg-muted">
                       <Image
                          src="https://picsum.photos/seed/materials/600/450"
                          alt="Stacked oak timber beams"
                          layout="fill" objectFit="cover" data-ai-hint="stack of european oak timber beams yard"
                      />
                   </div>
              </div>

              <h2 className="text-3xl mt-10 mb-4">Our Mission & Values</h2>
              <p>
                Our mission is simple: to provide exceptional timber products that enhance your property and stand the test of time. We operate on core values of:
              </p>
               <ul className="list-disc space-y-1 pl-5 !mb-6 marker:text-primary"> {/* Marker color */}
                    <li><strong>Quality:</strong> Uncompromising standards in materials and craftsmanship.</li>
                    <li><strong>Integrity:</strong> Transparent pricing, honest communication, and reliable service.</li>
                    <li><strong>Sustainability:</strong> Responsible sourcing and environmentally conscious practices.</li>
                    <li><strong>Innovation:</strong> Combining traditional techniques with modern design and user-friendly online tools.</li>
                    <li><strong>Customer Focus:</strong> Delivering outstanding support and ensuring client satisfaction.</li>
               </ul>
               <p>
                  Our innovative online configuration tools empower you to design the perfect structure for your needs, providing real-time estimates and visualizing your creation, backed by our expert team ready to assist with any custom requirements.
               </p>


              <h2 className="text-3xl mt-10 mb-4">Why Choose Timberline Commerce?</h2>
              <ul className="list-disc space-y-2 pl-5 marker:text-primary"> {/* Marker color */}
                <li><strong>Decades of Expertise:</strong> Combined experience in traditional timber framing and joinery.</li>
                <li><strong>Premium European Oak:</strong> Responsibly sourced and selected for character and durability.</li>
                <li><strong>Bespoke & Configurable:</strong> Tailor products online or collaborate on fully custom designs.</li>
                <li><strong>UK Wide Delivery:</strong> Reliable and careful delivery service across the mainland UK.</li>
                <li><strong>Dedicated Support:</strong> We provide guidance throughout your project lifecycle, from design to delivery.</li>
                 <li><strong>User-Friendly Tools:</strong> Easy-to-use online configurators for instant estimates and visualization.</li>
              </ul>

              <Separator className="my-10 border-border/50"/> {/* Lighter separator */}

              <p className="text-center text-lg text-muted-foreground">
                Explore our extensive product range, experiment with our intuitive configuration tools, or <a href="/contact">get in touch</a> to discuss your unique project requirements. We are excited to partner with you in building something truly special with timber.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}

    