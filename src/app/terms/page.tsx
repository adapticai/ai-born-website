import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.terms;

export default function TermsPage() {
  const effectiveDate = "1 November 2024";
  const lastUpdated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white pt-24 dark:bg-black">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <h1 className="font-outfit text-5xl font-extrabold tracking-tight text-black dark:text-white mb-8">
              Terms of Service
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
              <strong>Effective Date:</strong> {effectiveDate}
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
              <strong>Last Updated:</strong> {lastUpdated}
            </p>

            {/* Introduction */}
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the ai-born.org website (the &quot;Site&quot;) and any related services provided by Mic Press, LLC (&quot;Mic Press&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the Site, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            {/* 1. Acceptance of Terms */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              By accessing and using this website (ai-born.org), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms, you must not access or use the Site. We reserve the right to modify these Terms at any time. Your continued use of the Site following any changes constitutes your acceptance of the modified Terms.
            </p>

            {/* 2. Description of Service */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              2. Description of Service
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The Site provides information about the book <em>AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being</em> by Mehran Granfar, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Book descriptions, excerpts, and promotional materials</li>
              <li>Pre-order links to third-party retailers</li>
              <li>Email newsletter sign-up and communications</li>
              <li>VIP code redemption for exclusive benefits</li>
              <li>Pre-order bonus claim submission and fulfilment</li>
              <li>Media resources and press kit downloads</li>
              <li>Contact forms for bulk orders and media enquiries</li>
            </ul>

            {/* 3. User Accounts and Registration */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              3. User Accounts and Registration
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Certain features of the Site may require you to provide personal information such as your name and email address. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your information to keep it accurate</li>
              <li>Protect the confidentiality of any VIP codes or access credentials</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You are responsible for all activities that occur under your account or through your use of any VIP codes provided to you.
            </p>

            {/* 4. VIP Codes and Entitlements */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              4. VIP Codes and Entitlements
            </h2>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.1 Code Distribution
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              VIP codes are distributed at our discretion to early supporters, pre-order customers, and special event attendees. We reserve the right to determine eligibility for VIP codes.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.2 One Code Per User Per Format
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Each VIP code is limited to one redemption per user per book format (hardcover, e-book, or audiobook). Attempting to redeem multiple codes for the same format or sharing codes with others may result in revocation of benefits.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.3 Non-Transferable
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              VIP codes are non-transferable and may only be used by the recipient to whom they were issued. Codes may not be sold, bartered, or otherwise exchanged for value. We reserve the right to cancel codes that are resold or distributed without authorisation.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.4 Expiration Policy
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              VIP codes may have expiration dates, which will be clearly communicated at the time of issuance. Expired codes cannot be redeemed and will not be reissued except at our sole discretion. We recommend redeeming codes promptly upon receipt.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.5 Redemption Process
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              To redeem a VIP code, you must:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Visit the redemption page at ai-born.org/redeem</li>
              <li>Enter the complete 6-character code exactly as provided</li>
              <li>Provide a valid email address for benefit delivery</li>
              <li>Comply with any additional verification requirements</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Upon successful redemption, you will receive confirmation via email with details of your unlocked benefits. Benefits may include exclusive content, early access to materials, community access, and other perks as specified.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              4.6 Revocation of Benefits
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to revoke VIP benefits if we determine that a code was obtained or used fraudulently, in violation of these Terms, or in a manner inconsistent with the intended purpose. We are not liable for any loss or inconvenience resulting from such revocation.
            </p>

            {/* 5. Pre-order Bonus Terms */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              5. Pre-order Bonus Terms
            </h2>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              5.1 Proof of Purchase Requirements
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              To claim the pre-order bonus (Agent Charter Pack), you must submit valid proof of purchase. Acceptable proof includes:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Order confirmation email or screenshot</li>
              <li>Receipt showing book title, retailer, and order ID</li>
              <li>Invoice or purchase confirmation from retailer</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              All proof of purchase must clearly show:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>The book title: <em>AI-Born</em></li>
              <li>Order date and order ID</li>
              <li>Retailer name</li>
              <li>Format purchased (hardcover, e-book, or audiobook)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to verify the authenticity of all submitted proof of purchase and to reject claims that appear fraudulent or do not meet requirements.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              5.2 Delivery Timeline
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Upon verification of your proof of purchase, the Agent Charter Pack will be delivered to the email address you provided within 24 hours (excluding weekends and public holidays). If you do not receive your bonus pack within this timeframe, please contact us at info@micpress.com with your submission reference number.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              5.3 Eligible Retailers
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Pre-order bonuses are available for purchases made through any authorised retailer, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Amazon</li>
              <li>Barnes & Noble</li>
              <li>Bookshop.org</li>
              <li>Apple Books</li>
              <li>Google Play Books</li>
              <li>Kobo</li>
              <li>Target</li>
              <li>Walmart</li>
              <li>Independent bookstores</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to determine which retailers qualify as authorised retailers for bonus redemption purposes.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              5.4 Bonus Pack Contents
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The Agent Charter Pack includes:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>VP-agent templates for institutional design</li>
              <li>Sub-agent ladders and hierarchies</li>
              <li>Escalation and override protocol frameworks</li>
              <li>Cognitive Overhead Index (COI) diagnostic mini-tool (Google Sheet)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to modify the contents of the bonus pack without prior notice, provided that the value and utility of the materials remain substantially similar.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              5.5 Claim Limitations
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Each proof of purchase may only be used once to claim a bonus pack. Duplicate claims using the same order ID will be rejected. The pre-order bonus promotion may be subject to time limits and availability restrictions, which will be clearly communicated on the Site.
            </p>

            {/* 6. Prohibited Uses */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              6. Prohibited Uses
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You agree not to use the Site for any unlawful purpose or in any way that violates these Terms. Prohibited uses include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Attempting to gain unauthorised access to any portion of the Site or any systems or networks connected to the Site</li>
              <li>Using automated systems (bots, scrapers, etc.) to access the Site or collect data without our express written permission</li>
              <li>Submitting false, fraudulent, or misleading information, including fake proof of purchase or invalid VIP codes</li>
              <li>Attempting to reverse engineer, decompile, or disassemble any software or technology used on the Site</li>
              <li>Engaging in any activity that interferes with or disrupts the Site or servers and networks connected to the Site</li>
              <li>Using the Site to transmit any viruses, malware, or other harmful code</li>
              <li>Violating any applicable laws, regulations, or third-party rights</li>
              <li>Reselling, redistributing, or commercially exploiting VIP codes or bonus materials without authorisation</li>
              <li>Impersonating any person or entity, or falsely stating or misrepresenting your affiliation with any person or entity</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Violation of these prohibitions may result in immediate termination of your access to the Site and may subject you to civil and criminal liability.
            </p>

            {/* 7. Intellectual Property Rights */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              7. Intellectual Property Rights
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              All content on this website, including but not limited to text, graphics, logos, images, audio clips, digital downloads, data compilations, and software, is the property of Mic Press, LLC, its affiliates, or its content suppliers, and is protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The book <em>AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being</em> and all related materials, including excerpts, frameworks, templates, and bonus content, are protected by copyright and other intellectual property rights. The compilation of all content on the Site is the exclusive property of Mic Press, LLC and is protected by copyright laws.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site, except as follows:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
              <li>You may store files that are automatically cached by your web browser for display enhancement purposes</li>
              <li>You may print or download one copy of a reasonable number of pages of the Site for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
              <li>Bonus materials and VIP content may be used in accordance with the limited licence granted upon redemption, which permits personal, non-commercial use only</li>
            </ul>

            {/* 8. User-Generated Content */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              8. User-Generated Content
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              If you submit any content to the Site through contact forms, email communications, or other means (&quot;User Content&quot;), you grant Mic Press, LLC a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content in any media.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>You own or control all rights to the User Content</li>
              <li>The User Content is accurate and not misleading</li>
              <li>The User Content does not violate these Terms or any applicable law</li>
              <li>The User Content will not cause injury to any person or entity</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to remove or refuse to post any User Content for any reason in our sole discretion.
            </p>

            {/* 9. Third-Party Links and Services */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              9. Third-Party Links and Services
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The Site contains links to third-party websites and retailers, including but not limited to Amazon, Barnes & Noble, Bookshop.org, Apple Books, Google Play Books, and Kobo. These links are provided for your convenience only. We do not control, endorse, or assume responsibility for the content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              When you click on a retailer link and make a purchase, you are entering into a separate transaction with that retailer. All pre-orders, purchases, refunds, and customer service for book purchases are subject to the terms and conditions of the respective retailer. Mic Press, LLC is not responsible for:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Order fulfilment, shipping, or delivery of books purchased through third-party retailers</li>
              <li>Pricing, availability, or changes to product listings</li>
              <li>Refunds, returns, or exchanges</li>
              <li>Customer service issues related to retailer transactions</li>
              <li>Data collection or privacy practices of third-party retailers</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You acknowledge and agree that Mic Press, LLC shall not be liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any third-party websites or services.
            </p>

            {/* 10. Disclaimers and Limitations of Liability */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              10. Disclaimers and Limitations of Liability
            </h2>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              10.1 &quot;As Is&quot; Basis
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The Site and all materials, content, and services provided through the Site are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. Mic Press, LLC disclaims all warranties, express or implied, including, without limitation, implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              10.2 No Warranty of Accuracy
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We do not warrant that the Site will be uninterrupted, timely, secure, or error-free, that defects will be corrected, or that the Site or the servers that make it available are free of viruses or other harmful components. We do not warrant or make any representations regarding the use or results of the use of the materials on the Site in terms of their correctness, accuracy, reliability, or otherwise.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              10.3 Limitation of Liability
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              In no event shall Mic Press, LLC, its officers, directors, employees, agents, affiliates, or content suppliers be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your access to or use of or inability to access or use the Site</li>
              <li>Any conduct or content of any third party on the Site, including without limitation, any defamatory, offensive, or illegal conduct of other users or third parties</li>
              <li>Any content obtained from the Site</li>
              <li>Unauthorised access, use, or alteration of your transmissions or content</li>
              <li>Errors or omissions in any content or for any loss or damage of any kind incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available via the Site</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              This limitation of liability applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if Mic Press, LLC has been advised of the possibility of such damage. Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for incidental or consequential damages. Accordingly, some of the above limitations may not apply to you.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              10.4 Maximum Liability
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              In any event, the total liability of Mic Press, LLC to you for all damages, losses, and causes of action (whether in contract, tort, including negligence, or otherwise) shall not exceed the amount paid by you, if any, for accessing the Site or fifty dollars ($50.00 USD), whichever is less.
            </p>

            {/* 11. Indemnification */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              11. Indemnification
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You agree to defend, indemnify, and hold harmless Mic Press, LLC, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgements, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Your violation of these Terms or any applicable law or regulation</li>
              <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
              <li>Your use of the Site or any content obtained through the Site</li>
              <li>Any User Content you submit, post, or transmit through the Site</li>
              <li>Any fraudulent activity conducted by you, including submission of false proof of purchase or use of invalid VIP codes</li>
            </ul>

            {/* 12. Termination */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              12. Termination
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right, in our sole discretion, to terminate or suspend your access to all or part of the Site, including your ability to redeem VIP codes or claim bonuses, for any reason or no reason, with or without notice, effective immediately. This includes, without limitation, if we believe you have violated or acted inconsistently with the letter or spirit of these Terms.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Upon termination, your right to use the Site will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>

            {/* 13. Governing Law */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              13. Governing Law
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of the State of New York, United States of America, without giving effect to any choice or conflict of law provision or rule.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Any legal suit, action, or proceeding arising out of or related to these Terms or the Site shall be instituted exclusively in the federal courts of the United States or the courts of the State of New York, in each case located in New York County. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
            </p>

            {/* 14. Dispute Resolution */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              14. Dispute Resolution
            </h2>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              14.1 Informal Resolution
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Before initiating any formal dispute resolution process, you agree to contact us at info@micpress.com to attempt to resolve the dispute informally. We will make a good faith effort to resolve any disputes in a timely and amicable manner.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              14.2 Arbitration Agreement
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              If we are unable to resolve a dispute informally, any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this agreement to arbitrate, shall be determined by binding arbitration in New York, New York, before one arbitrator. The arbitration shall be administered by JAMS pursuant to its Comprehensive Arbitration Rules and Procedures.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              14.3 Class Action Waiver
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You agree that any arbitration or proceeding shall be limited to the dispute between you and Mic Press, LLC individually. To the full extent permitted by law, (i) no arbitration or proceeding shall be joined with any other; (ii) there is no right or authority for any dispute to be arbitrated or resolved on a class action-basis or to utilise class action procedures; and (iii) there is no right or authority for any dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              14.4 Exceptions
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Notwithstanding the foregoing, you and Mic Press, LLC may bring a claim in a court of competent jurisdiction for injunctive relief or other equitable relief to protect intellectual property rights or confidential information.
            </p>

            {/* 15. Changes to Terms */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              15. Changes to Terms
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We reserve the right to modify these Terms at any time, in our sole discretion. If we make material changes to these Terms, we will notify you by updating the &quot;Last Updated&quot; date at the top of this page and, at our discretion, may provide additional notice (such as adding a statement to our homepage or sending you an email notification).
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page regularly so you are aware of any changes, as they are binding on you.
            </p>

            {/* 16. Miscellaneous */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              16. Miscellaneous
            </h2>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              16.1 Entire Agreement
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Mic Press, LLC regarding the use of the Site and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              16.2 Waiver and Severability
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              No waiver by Mic Press, LLC of any term or condition set forth in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of Mic Press, LLC to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of these Terms will continue in full force and effect.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              16.3 Assignment
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              These Terms, and any rights and licences granted hereunder, may not be transferred or assigned by you, but may be assigned by Mic Press, LLC without restriction. Any attempted transfer or assignment by you in violation hereof shall be null and void.
            </p>

            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-black dark:text-white mt-8 mb-4">
              16.4 Force Majeure
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Mic Press, LLC shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond our reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation, acts of God, war, terrorism, civil unrest, labour disputes, or acts or omissions of third parties.
            </p>

            {/* 17. Contact Information */}
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              17. Contact Information
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              If you have any questions, concerns, or complaints about these Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-none mb-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                <strong>Mic Press, LLC</strong>
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                Email:{" "}
                <a href="mailto:info@micpress.com" className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 underline transition-colors">
                  info@micpress.com
                </a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Website: <a href="https://ai-born.org" className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 underline transition-colors">ai-born.org</a>
              </p>
            </div>

            {/* Acknowledgement */}
            <div className="bg-slate-100 dark:bg-slate-900 border-l-4 border-black dark:border-white p-6 mt-12 rounded-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                By using this Site, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </article>
        </section>
      </main>
      <BookFooter />
    </>
  );
}
