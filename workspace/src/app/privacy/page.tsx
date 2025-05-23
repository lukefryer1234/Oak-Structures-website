
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Timberline Commerce collects, uses, and protects your personal data when you use our website and services.",
};


const companyInfo = {
    email: "info@timberline.com",
    phone: "01234 567 890",
    address: "12 Timber Yard, Forest Industrial Estate, Bristol, BS1 1AD"
};


export default function PrivacyPage() {
  return (
     <div>
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto prose prose-lg lg:prose-xl text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-p:leading-relaxed prose-p:mb-4">
            <h1 className="!mb-2 border-b border-border/50 pb-2">Privacy Policy</h1>
            <p className="lead text-muted-foreground !mt-0 !mb-6">Last updated: May 6, 2025</p>

            <p>Timberline Commerce (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the [Your Website URL - Replace Me] website (the &quot;Service&quot;).</p>
            <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.</p>
            <p>We use your data to provide and improve the Service, process your orders, and communicate with you. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

            <h2>1. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <h3>Types of Data Collected</h3>
            <h4>Personal Data</h4>
            <p>While using our Service, particularly during registration, checkout, or when submitting inquiries, we may ask you to provide us with certain personally identifiable information (&quot;Personal Data&quot;). This may include, but is not limited to:</p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Billing Address (Street address, Town, Postcode)</li>
              <li>Shipping Address (Street address, Town, Postcode)</li>
              <li>Order history</li>
               <li>Communication records (e.g., custom order inquiries, support requests)</li>
              <li>Cookies and Usage Data</li>
            </ul>
            <h4>Usage Data</h4>
            <p>We may automatically collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your computer&apos;s Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data. We use this data to analyze trends, administer the site, track users&apos; movements around the site, and gather demographic information about our user base as a whole.</p>
             <h4>Tracking &amp; Cookies Data</h4>
             <p>We use cookies and similar tracking technologies (like web beacons and pixels) to track the activity on our Service, hold certain information, and improve your user experience. Cookies are files with a small amount of data which may include an anonymous unique identifier. Examples of Cookies we use:</p>
             <ul>
                 <li><strong>Session Cookies:</strong> We use Session Cookies to operate our Service (e.g., keeping you logged in, maintaining your shopping basket).</li>
                 <li><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings.</li>
                 <li><strong>Security Cookies:</strong> We use Security Cookies for security purposes.</li>
                  <li><strong>Analytics Cookies:</strong> We may use third-party Service Providers (like Google Analytics) to monitor and analyze the use of our Service.</li>
             </ul>
             <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service effectively.</p>

            <h2>2. Use of Data</h2>
            <p>Timberline Commerce uses the collected data for purposes including:</p>
            <ul>
              <li>To provide, operate, and maintain our Service</li>
              <li>To process your orders, including payment and delivery</li>
              <li>To manage your account and provide customer support</li>
              <li>To communicate with you regarding your orders, inquiries, or account information</li>
              <li>To notify you about changes to our Service, terms, or policies</li>
              <li>To allow you to participate in interactive features of our Service (e.g., product configuration)</li>
              <li>To personalize your experience on our Service</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of the Service and prevent fraudulent activity</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Legal Basis for Processing (GDPR)</h2>
            <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Data we collect and the specific context:</p>
            <ul>
                <li><strong>Contractual Necessity:</strong> Processing is necessary to perform a contract with you (e.g., to process and deliver your order).</li>
                <li><strong>Consent:</strong> You have given us explicit permission to process your data for a specific purpose (e.g., signing up for a newsletter - if applicable).</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests (e.g., improving our service, preventing fraud), provided these interests are not overridden by your data protection rights.</li>
                <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law (e.g., retaining transaction records for tax purposes).</li>
            </ul>

            <h2>4. Data Retention</h2>
            <p>We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain transaction data as required by law (e.g., for tax and accounting purposes, typically 6-7 years). Account information will be retained as long as your account is active or as needed to provide you services. Usage data is generally retained for a shorter period, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer time periods.</p>

            <h2>5. Data Transfer</h2>
            <p>Your information, including Personal Data, may be transferred to — and maintained on — computers and servers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ. Our primary servers are located within the [Specify Location, e.g., UK/EEA]. If we transfer data outside the EEA, we will ensure appropriate safeguards are in place (e.g., Standard Contractual Clauses, adequacy decisions).</p>
            <p>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>

            <h2>6. Data Disclosure</h2>
            <p>We will not share your Personal Data with third parties except in the following circumstances:</p>
             <ul>
                <li><strong>Service Providers:</strong> To trusted third parties who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors like Stripe/PayPal, delivery companies, email service providers, cloud hosting), so long as those parties agree to keep this information confidential and secure.</li>
                <li><strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
                <li><strong>Business Transfer:</strong> If Timberline Commerce is involved in a merger, acquisition or asset sale, your Personal Data may be transferred.</li>
                 <li><strong>Protection of Rights:</strong> To protect and defend the rights or property of Timberline Commerce, or to investigate potential wrongdoing in connection with the Service.</li>
             </ul>

            <h2>7. Data Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. This includes using secure servers, encryption (e.g., SSL/TLS), and access controls. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

             <h2>8. Service Providers</h2>
             <p>We may employ third party companies and individuals to facilitate our Service (&quot;Service Providers&quot;), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. Examples include:</p>
             <ul>
                 <li><strong>Payment Processors:</strong> Stripe, PayPal (Their privacy policies govern their data use).</li>
                 <li><strong>Analytics:</strong> Google Analytics (Data is typically anonymized or pseudonymized).</li>
                  <li><strong>Email Delivery:</strong> [Your Email Provider, e.g., SendGrid, Mailgun]</li>
                  <li><strong>Hosting:</strong> [Your Hosting Provider, e.g., Vercel, AWS]</li>
             </ul>


            <h2>9. Your Data Protection Rights (GDPR/UK GDPR)</h2>
            <p>You have certain data protection rights, including:</p>
             <ul>
                 <li><strong>The right to access:</strong> You can request copies of your personal data.</li>
                 <li><strong>The right to rectification:</strong> You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete (often possible via your account page).</li>
                 <li><strong>The right to erasure:</strong> You can request that we erase your personal data, under certain conditions.</li>
                 <li><strong>The right to restrict processing:</strong> You can request that we restrict the processing of your personal data, under certain conditions.</li>
                 <li><strong>The right to object to processing:</strong> You can object to our processing of your personal data, under certain conditions (particularly for direct marketing).</li>
                 <li><strong>The right to data portability:</strong> You can request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                  <li><strong>The right to withdraw consent:</strong> If processing is based on consent, you have the right to withdraw that consent at any time.</li>
             </ul>
              <p>To exercise any of these rights, please contact us using the details below. We may need to verify your identity before responding to such requests.</p>
              <p>You also have the right to complain to a Data Protection Authority (like the Information Commissioner&apos;s Office (ICO) in the UK) about our collection and use of your Personal Data.</p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>Our Service does not address anyone under the age of 18 (&quot;Children&quot;). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>


            <h2>11. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We may also inform you via email or a prominent notice on our Service.</p>
            <p>You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
              <li>By email: <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a></li>
              <li>By visiting this page on our website: <a href="/contact">Contact Us</a></li>
              <li>By phone number: <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}>{companyInfo.phone}</a></li>
               <li>By post: {companyInfo.address}</li>
            </ul>
          </div>
        </div>
    </div>
  );
}
