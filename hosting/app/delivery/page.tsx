
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, PackageCheck, AlertTriangle, Info, Building } from "lucide-react"; // Icons
import type { Metadata } from 'next';
// Removed Image import as it's handled globally

export const metadata: Metadata = {
  title: "Delivery Information",
  description: "Details on delivery costs, lead times, and requirements for Timberline Commerce orders, including kerbside delivery information.",
};

// Placeholder delivery settings - Fetch from Admin settings ideally
const deliverySettings = {
    freeDeliveryThreshold: 1000, // Example value
    ratePerM3: 50, // Example value
    minimumDeliveryCharge: 25, // Example value
    leadTimeGeneral: "5-10 working days", // Example value
    leadTimeConfigured: "4-6 weeks (estimated)", // Example value
    leadTimeBeamsFlooring: "2-4 weeks (estimated)", // Example value
};

// Function to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
}

export default function DeliveryPage() {
  return (
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-12">
                 <Truck className="h-12 w-12 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-bold text-foreground">Delivery Information</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to know about how we deliver your Timberline Commerce order.</p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">

                {/* Delivery Costs Card */}
                 {/* Added transparency and blur */}
                <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                        {/* <Truck className="h-6 w-6 text-primary" /> */}
                        <CardTitle className="text-xl text-card-foreground">Delivery Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
                        <p>
                            <strong className="text-card-foreground">Garages, Gazebos, Porches:</strong> Delivery cost is usually included in the product price shown (subject to standard UK mainland locations).
                        </p>
                        <p>
                            <strong className="text-card-foreground">Oak Beams & Oak Flooring:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                            <li>Orders totalling <strong>{formatPrice(deliverySettings.freeDeliveryThreshold)} or more</strong> (excl. VAT) qualify for <strong className="text-primary">FREE standard delivery</strong>.</li>
                            <li>Orders below this threshold incur a charge calculated by total volume: <strong>{formatPrice(deliverySettings.ratePerM3)} per m³</strong>.</li>
                            <li>A <strong>minimum charge of {formatPrice(deliverySettings.minimumDeliveryCharge)}</strong> applies if the volume cost is lower.</li>
                        </ul>
                         <p>
                             <strong className="text-card-foreground">Special Deals:</strong> Shipping cost depends on the item type (included for structures, calculated by volume/threshold for beams/flooring).
                         </p>
                         <p className="mt-3 italic">
                            The final delivery cost is calculated at checkout based on your basket and address.
                         </p>
                    </CardContent>
                </Card>

                {/* Lead Times Card */}
                 {/* Added transparency and blur */}
                <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                         {/* <PackageCheck className="h-6 w-6 text-primary" /> */}
                        <CardTitle className="text-xl text-card-foreground">Estimated Lead Times</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
                        <p>
                            Lead times are estimates from order confirmation and may vary. We'll provide a more specific estimate after your order.
                        </p>
                        <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                             <li><strong>Stock Items / Special Deals:</strong> ~{deliverySettings.leadTimeGeneral}.</li>
                             <li><strong>Configured Structures (Garages etc.):</strong> ~{deliverySettings.leadTimeConfigured} (manufacture + delivery).</li>
                             <li><strong>Custom Beams / Flooring:</strong> ~{deliverySettings.leadTimeBeamsFlooring}.</li>
                        </ul>
                         <p className="mt-3 italic">
                            We will contact you before dispatch to arrange a suitable delivery date.
                         </p>
                    </CardContent>
                </Card>

                 {/* Delivery Requirements Card */}
                  {/* Added transparency and blur */}
                 <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                         {/* <AlertTriangle className="h-6 w-6 text-primary" /> */}
                        <CardTitle className="text-xl text-card-foreground">Delivery & Offloading</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
                         <p className="font-medium text-card-foreground">
                            Standard delivery is KERBSIDE ONLY.
                         </p>
                         <p>
                           This means the delivery vehicle will offload goods to the nearest safe and accessible point at the property boundary.
                         </p>
                         <p>
                            <strong className="text-card-foreground">Your Responsibilities:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                            <li>Ensure clear, safe access for large delivery vehicles (check for restrictions).</li>
                            <li><strong>Arrange adequate manpower or mechanical means (e.g., forklift) to move items from kerbside. Oak is heavy!</strong></li>
                            <li>Notify us of any potential access issues *before* delivery is scheduled.</li>
                        </ul>
                         <p className="mt-3 italic text-destructive">
                            <AlertTriangle className="inline h-4 w-4 mr-1"/> Failed deliveries due to inadequate access or offloading arrangements will incur re-delivery charges.
                         </p>
                    </CardContent>
                </Card>
            </div>

             {/* General Info Section */}
              {/* Added transparency and blur */}
             <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm mt-12">
                 <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                     <Info className="h-6 w-6 text-primary" />
                     <CardTitle className="text-xl text-card-foreground">Important Notes</CardTitle>
                 </CardHeader>
                  {/* Multi-column layout */}
                 <CardContent className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2 gap-8">
                     <p className="break-inside-avoid mb-3">We currently only deliver to standard UK mainland addresses. Please contact us for quotes to remote areas (Scottish Highlands, Islands, Northern Ireland etc.) as surcharges or different arrangements may apply.</p>
                     <p className="break-inside-avoid mb-3">Please inspect your delivery carefully upon arrival. Report any damage or discrepancies to the driver (note it on the delivery paperwork) and notify us with photos within 48 hours.</p>
                     <p className="break-inside-avoid mb-3">Delivery dates are scheduled in good faith but are estimates. We are not liable for delays outside our direct control (e.g., traffic, weather, carrier issues).</p>
                     <p className="break-inside-avoid mb-3">If your order contains items with different lead times, the entire order will typically be dispatched once all items are ready, unless otherwise agreed.</p>
                     <p className="break-inside-avoid mb-3">Ensure you have adequate space prepared for storing the delivered materials safely and protected from the elements if installation is not immediate.</p>
                     <p className="break-inside-avoid mb-3">If you have any questions about delivery not covered here, please <a href="/contact" className="text-primary hover:underline font-medium">contact us</a> before placing your order.</p>
                 </CardContent>
             </Card>
        </div>
    </div>
  );
}

    