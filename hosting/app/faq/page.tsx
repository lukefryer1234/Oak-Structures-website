
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Metadata } from 'next';
import { HelpCircle } from "lucide-react"; // Icon
import { Button } from "@/components/ui/button";
// Removed Image import as it's handled globally

export const metadata: Metadata = {
  title: "FAQ",
  description: "Find answers to frequently asked questions about Timberline Commerce products, ordering, delivery, configuration, and more.",
};


const faqItems = [
  {
    question: "What types of oak do you use?",
    answer: "We primarily use high-quality European Oak. Depending on the product, you can often choose between Reclaimed Oak (with character and history), Kilned Dried Oak (stable and suitable for interiors like flooring), and Green Oak (typically for structural frames like beams, which will dry and settle naturally over time)."
  },
  {
    question: "Can I customise products beyond the online configuration options?",
    answer: "Absolutely! Our online configurators cover common options, but we specialise in bespoke timber structures. If you have specific requirements, dimensions, or design ideas not covered online, please use our Custom Order Inquiry form or contact us directly to discuss your project."
  },
  {
    question: "What are the typical lead times?",
    answer: "Lead times vary. Stock items/deals are often dispatched within 5-10 working days. Configured structures (garages, gazebos, porches) usually take 4-6 weeks for manufacture. Custom beams/flooring typically take 2-4 weeks. These are estimates; we provide a more accurate timeframe after order placement. See our Delivery Information page for more details."
  },
   {
    question: "What does 'kerbside delivery' mean and what are my responsibilities?",
    answer: "Kerbside delivery means the driver offloads goods to the nearest accessible point at your property boundary. You MUST arrange means (manpower or machinery like a forklift) to move heavy items from there. Ensure clear access for large trucks. Failed deliveries due to access/offloading issues incur re-delivery fees. Please see our Delivery Information page."
  },
  {
    question: "Do I need planning permission?",
    answer: "Planning requirements depend on the structure's size, location, and local rules. Larger structures often need permission. Porches might fall under permitted development. We strongly advise checking with your local planning authority BEFORE ordering substantial structures. Obtaining permission is your responsibility."
  },
  {
    question: "Do you offer installation services?",
    answer: "We focus on designing, manufacturing, and supplying high-quality timber frames and products. We do not offer installation services directly. Our kits are designed for competent DIY assembly or by a qualified local builder/carpenter."
  },
   {
     question: "How is the price calculated for configured items?",
     answer: "For garages, gazebos, and porches, the price is based on the specific combination of options selected. For oak beams, it's Volume (m³) × Price/m³ (varies by oak type). For oak flooring, it's Area (m²) × Price/m² (varies by oak type). Prices update dynamically in the configurator (excluding VAT/delivery)."
   },
   {
    question: "What payment methods do you accept?",
    answer: "We accept secure online payments via major Credit/Debit cards (processed by Stripe) and PayPal."
  },
  {
    question: "How do I report issues with my delivery?",
    answer: "Please inspect your delivery carefully upon arrival. Note any damage or discrepancies on the driver's paperwork and contact us with details and photos within 48 hours of receipt."
  },
];


export default function FAQPage() {
  return (
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-12">
                 <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about our products and services.</p>
            </div>

            {/* Added transparency and blur */}
            <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-md border border-border">
                <Accordion type="single" collapsible className="w-full">
                    {/* Lighter border for accordion items */}
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index + 1}`} className="border-b border-border/50 last:border-b-0">
                            <AccordionTrigger className="text-left text-lg font-medium text-card-foreground hover:text-primary py-4 hover:no-underline [&[data-state=open]>svg]:text-primary">
                                {item.question}
                            </AccordionTrigger>
                            {/* Use prose for answer formatting */}
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-4 pt-1 prose prose-sm max-w-none">
                                <p>{item.answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="mt-12 text-center text-muted-foreground">
               <p className="text-lg">Can't find the answer you're looking for?</p>
               <Button variant="link" asChild className="text-lg px-1">
                    <a href="/contact">Contact our support team</a>
               </Button>

            </div>
        </div>
    </div>
  );
}

    