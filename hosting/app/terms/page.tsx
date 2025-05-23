
import type { Metadata } from 'next';
// Removed Image import as it's handled globally

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the terms and conditions for using the Timberline Commerce website and purchasing our products.",
};

// Placeholder data used in text - replace with dynamic fetching if needed
const companyInfo = {
    email: "info@timberline.com",
    phone: "01234 567 890"
};

export default function TermsPage() {
  return (
     // Removed relative isolate and background image handling
     <div>
        <div className="container mx-auto px-4 py-12 md:py-16">
           {/* Use prose for readable text formatting, customize tailwind prefixes if needed */}
          <div className="max-w-3xl mx-auto prose prose-lg lg:prose-xl text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-p:leading-relaxed prose-p:mb-4">
             {/* Lighter border */}
            <h1 className="!mb-2 border-b border-border/50 pb-2">Terms and Conditions</h1>
            <p className="lead text-muted-foreground !mt-0 !mb-6">Last updated: May 6, 2025</p>

            <p>Welcome to Timberline Commerce! These terms and conditions outline the rules and regulations for the use of Timberline Commerce's Website, located at [Your Website URL - Replace Me].</p>

            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Timberline Commerce if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2>1. Definitions</h2>
            <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company (Timberline Commerce). "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of the United Kingdom.</p>

            <h2>2. Use of the Website</h2>
            <p>By accessing the website, you warrant and represent that you are at least 18 years of age and possess the legal authority to enter into this agreement and use this website in accordance with all terms and conditions herein. You agree to comply with all applicable laws and regulations regarding your use of the website.</p>

            <h2>3. Products and Services</h2>
            <p>We endeavor to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products. Timber properties such as grain pattern and exact colour may vary.</p>
            <p>All products are subject to availability, and we cannot guarantee that items will be in stock. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time for any reason.</p>
            <p><strong>Configured Products:</strong> Products configured using our online tools are manufactured based on the specifications you provide at the time of order. It is your responsibility to ensure all configuration details (dimensions, options, materials, etc.) are correct before submitting your order. Due to their bespoke nature, returns, cancellations, or exchanges for correctly supplied configured items are generally not possible unless the item is faulty or does not conform to the agreed specification. Please review your configuration carefully.</p>

             <h2>4. Ordering and Payment</h2>
             <p>You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.</p>
             <p>Sales tax (VAT) will be added to the price of purchases as required by law. We accept payments via Stripe and PayPal. You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. Payment must be made in full before the dispatch or commencement of manufacture of goods.</p>
             <p>We reserve the right to refuse any order placed through the Site. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.</p>

            <h2>5. Delivery</h2>
            <p>Please review our dedicated <a href="/delivery">Delivery Information</a> page for full details on costs, timescales, access requirements, and responsibilities.</p>
            <p>Delivery times provided are estimates and cannot be guaranteed. Delivery costs are calculated at checkout based on the items in your basket, their volume/weight, and the delivery postcode, according to the logic outlined on our Delivery Information page.</p>
            <p>It is your responsibility to ensure suitable access for large delivery vehicles (e.g., check for narrow lanes, overhanging trees, tight corners) and appropriate means for offloading heavy or bulky items. Failed deliveries due to access issues or lack of appropriate offloading arrangements may incur re-delivery charges.</p>

            <h2>6. Returns and Refunds</h2>
            <p><strong>Standard Items (e.g., some Special Deals):</strong> For non-customised items, you have the right to cancel your order within 14 days of receiving the goods under the Consumer Contracts Regulations. Goods must be returned in their original condition and packaging at your own cost. Please contact us to initiate a return.</p>
            <p><strong>Configured and Bespoke Items:</strong> As stated in Section 3, items manufactured to your specific configuration or bespoke requirements cannot be returned or refunded unless they are proven to be faulty or do not materially conform to the agreed specifications. Please inspect goods thoroughly upon delivery and report any damage or discrepancies to us within 48 hours, providing photographic evidence where possible.</p>
            {/* <p>Please refer to our full [Link to Returns Policy Page - Create This Page] for detailed procedures.</p> */}

            <h2>7. Intellectual Property</h2>
            <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United Kingdom, international copyright laws, and international conventions. Except as expressly permitted in writing by us, you may not copy, reproduce, aggregate, republish, upload, post, publicly display, encode, translate, transmit, distribute, sell, license, or otherwise exploit for any commercial purpose whatsoever, any part of the Site, the Content or Marks.</p>

            <h2>8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, Timberline Commerce shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service; (c) any content obtained from the Service; and (d) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
            <p>Our liability for any product purchased through the site is strictly limited to the purchase price of that product.</p>


            <h2>9. Governing Law</h2>
            <p>These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of England and Wales applicable to agreements made and to be entirely performed within England and Wales, without regard to its conflict of law principles. You irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.</p>

            <h2>10. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to update, change or replace any part of these Terms and Conditions by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms and Conditions constitutes acceptance of those changes.</p>

            <h2>Contact Information</h2>
            <p>Questions about the Terms and Conditions should be sent to us via:</p>
             <ul>
                 <li>Email: <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a></li>
                 <li>Our Contact Page: <a href="/contact">Contact Us</a></li>
                 <li>Phone: <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}>{companyInfo.phone}</a></li>
             </ul>
          </div>
        </div>
    </div>
  );
}

    