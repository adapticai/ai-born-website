import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.privacy;

export default function PrivacyPolicyPage() {
  const lastUpdated = '18 October 2025';

  return (
    <div className="min-h-screen bg-brand-obsidian text-brand-porcelain">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <a
            href="/"
            className="text-brand-cyan hover:text-brand-cyan/80 transition-colors inline-flex items-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to AI-Born
          </a>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/60 font-['Inter']">
            Last updated: {lastUpdated}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 font-['Inter']">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed mb-6">
            Mic Press, LLC (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{' '}
            <a href="https://ai-born.org" className="text-brand-cyan hover:underline">
              ai-born.org
            </a>{' '}
            (the &ldquo;Site&rdquo;). This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our Site and interact with our services.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            We are committed to protecting your privacy and complying with applicable data protection laws,
            including the European Union&rsquo;s General Data Protection Regulation (GDPR) and the California
            Consumer Privacy Act (CCPA).
          </p>
          <p className="text-lg leading-relaxed">
            By using the Site, you consent to the data practices described in this policy. If you do not
            agree with the terms of this Privacy Policy, please do not access the Site.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4 font-['Outfit']">Contents</h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li><a href="#information-we-collect" className="text-brand-cyan hover:underline">Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-brand-cyan hover:underline">How We Use Your Information</a></li>
            <li><a href="#data-sharing" className="text-brand-cyan hover:underline">Data Sharing and Disclosure</a></li>
            <li><a href="#cookies" className="text-brand-cyan hover:underline">Cookies and Tracking Technologies</a></li>
            <li><a href="#your-rights" className="text-brand-cyan hover:underline">Your Privacy Rights (GDPR/CCPA)</a></li>
            <li><a href="#data-retention" className="text-brand-cyan hover:underline">Data Retention</a></li>
            <li><a href="#security" className="text-brand-cyan hover:underline">Security Measures</a></li>
            <li><a href="#children" className="text-brand-cyan hover:underline">Children&rsquo;s Privacy</a></li>
            <li><a href="#international" className="text-brand-cyan hover:underline">International Data Transfers</a></li>
            <li><a href="#changes" className="text-brand-cyan hover:underline">Changes to This Privacy Policy</a></li>
            <li><a href="#contact" className="text-brand-cyan hover:underline">Contact Information</a></li>
          </ol>
        </nav>

        {/* 1. Information We Collect */}
        <section id="information-we-collect" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            1. Information We Collect
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Personal Information You Provide
              </h3>
              <p className="mb-4 leading-relaxed">
                We collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li>Sign up for our newsletter or request a free excerpt</li>
                <li>Submit a pre-order bonus claim with proof of purchase</li>
                <li>Complete a contact form for media inquiries, speaking requests, or bulk orders</li>
                <li>Interact with our email communications</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                This information may include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li><strong>Name</strong> (optional in most cases)</li>
                <li><strong>Email address</strong> (required for communications)</li>
                <li><strong>Order details</strong> (retailer, order ID, format) when claiming bonuses</li>
                <li><strong>Company name and role</strong> (for media or bulk order requests)</li>
                <li><strong>Any other information you choose to provide</strong> in forms or correspondence</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Automatically Collected Information
              </h3>
              <p className="mb-4 leading-relaxed">
                When you visit our Site, we automatically collect certain information about your device and
                browsing behaviour, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage data:</strong> Pages viewed, time spent on pages, click patterns, referral sources</li>
                <li><strong>Analytics data:</strong> Aggregated metrics about site performance and user engagement</li>
                <li><strong>Location data:</strong> Approximate geographic location based on IP address (for geo-aware retailer recommendations)</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We collect this information using cookies and similar tracking technologies (see Section 4 below).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Information from Third Parties
              </h3>
              <p className="leading-relaxed">
                We may receive limited information from third-party services we use, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80 mt-4">
                <li><strong>Email service providers:</strong> Delivery status, open rates, click-through rates</li>
                <li><strong>Analytics platforms:</strong> Aggregated usage statistics and performance metrics</li>
                <li><strong>Payment verification services:</strong> Order confirmation data when you claim pre-order bonuses</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section id="how-we-use" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            2. How We Use Your Information
          </h2>
          <p className="mb-4 leading-relaxed">
            We use the information we collect for the following purposes:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                To Provide Services
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Deliver requested content (free excerpts, press kits, bonus materials)</li>
                <li>Process and fulfil pre-order bonus claims</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Facilitate media requests and speaking engagements</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                To Communicate with You
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Send transactional emails (download links, bonus delivery confirmations)</li>
                <li>Provide book launch updates and announcements (with your consent)</li>
                <li>Respond to your questions and requests</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                To Improve Our Site
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Analyse usage patterns and site performance</li>
                <li>Optimise user experience and navigation</li>
                <li>Conduct A/B testing for content and features</li>
                <li>Identify and fix technical issues</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                For Business Operations
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Track pre-order metrics and retailer performance</li>
                <li>Coordinate distributed bulk orders</li>
                <li>Monitor campaign effectiveness</li>
                <li>Maintain records for legal and accounting purposes</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                For Legal Compliance
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Comply with applicable laws and regulations</li>
                <li>Respond to legal requests and prevent fraud</li>
                <li>Enforce our terms of service</li>
                <li>Protect the rights, property, and safety of Mic Press, LLC and our users</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-white/80">
            <strong>Legal Basis for Processing (GDPR):</strong> We process your personal data based on:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-white/80 mt-2">
            <li><strong>Consent:</strong> When you opt in to receive marketing communications</li>
            <li><strong>Contract:</strong> To fulfil services you request (excerpts, bonuses)</li>
            <li><strong>Legitimate interests:</strong> To improve our Site and analyse usage (balanced against your privacy rights)</li>
            <li><strong>Legal obligation:</strong> To comply with applicable laws</li>
          </ul>
        </section>

        {/* 3. Data Sharing and Disclosure */}
        <section id="data-sharing" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            3. Data Sharing and Disclosure
          </h2>
          <p className="mb-6 leading-relaxed">
            We do not sell, rent, or trade your personal information. We may share your information only in
            the following limited circumstances:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Service Providers
              </h3>
              <p className="text-white/80 leading-relaxed">
                We work with trusted third-party service providers who help us operate the Site and deliver
                services. These may include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 mt-2">
                <li>Email delivery platforms (e.g., SendGrid, Postmark, Resend)</li>
                <li>Analytics services (privacy-friendly alternatives like Plausible or Fathom)</li>
                <li>Cloud storage providers (e.g., AWS S3, Cloudflare R2)</li>
                <li>Hosting and CDN services (e.g., Vercel, Cloudflare)</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-2">
                These providers are contractually obligated to use your data only for the purposes we specify
                and to protect it according to industry standards.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Legal Requirements
              </h3>
              <p className="text-white/80 leading-relaxed">
                We may disclose your information if required by law or in response to valid legal requests, such as:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 mt-2">
                <li>Subpoenas, court orders, or legal processes</li>
                <li>Government or regulatory investigations</li>
                <li>To protect the rights, property, or safety of Mic Press, LLC, our users, or the public</li>
                <li>To detect, prevent, or address fraud, security, or technical issues</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Business Transfers
              </h3>
              <p className="text-white/80 leading-relaxed">
                In the event of a merger, acquisition, reorganisation, or sale of assets, your information may
                be transferred as part of that transaction. We will notify you via email and/or a prominent notice
                on our Site of any such change in ownership or control of your personal information.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Aggregated or Anonymised Data
              </h3>
              <p className="text-white/80 leading-relaxed">
                We may share aggregated or anonymised data that cannot reasonably be used to identify you
                (e.g., overall site traffic statistics, demographic trends) for marketing, research, or
                business development purposes.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Cookies and Tracking Technologies */}
        <section id="cookies" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            4. Cookies and Tracking Technologies
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                What Are Cookies?
              </h3>
              <p className="leading-relaxed text-white/80">
                Cookies are small text files stored on your device by your web browser. They help us recognise
                your device and remember information about your visit, such as your preferences and actions on the Site.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Types of Cookies We Use
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Required for the Site to function properly. These cookies enable core functionality such as
                    security, network management, and accessibility. You cannot opt out of these cookies without
                    limiting the Site&rsquo;s functionality.
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    <strong>Examples:</strong> Session management, security tokens, load balancing
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Help us understand how visitors interact with the Site by collecting and reporting information
                    anonymously. We use privacy-friendly analytics tools that do not track you across sites.
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    <strong>Examples:</strong> Page views, session duration, click patterns, referral sources
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Functional Cookies</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Enable enhanced functionality and personalisation, such as remembering your geo-region
                    preference for retailer recommendations or your previously selected book format.
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    <strong>Examples:</strong> Region selection (US/UK/EU/AU), format preference (hardcover/eBook)
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Marketing/Tracking Cookies</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Track your activity across websites to deliver more relevant advertising and measure campaign
                    effectiveness. We only use these with your explicit consent.
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    <strong>Examples:</strong> UTM campaign tracking, conversion pixels, retargeting tags
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Third-Party Cookies
              </h3>
              <p className="leading-relaxed text-white/80 mb-4">
                We may use services from third parties (such as Google Tag Manager or analytics providers)
                that set their own cookies. These third parties have their own privacy policies governing
                their use of your information.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-brand-cyan font-['Outfit']">
                Managing Your Cookie Preferences
              </h3>
              <p className="leading-relaxed text-white/80 mb-4">
                You can control cookies through your browser settings and our cookie consent banner
                (if you are in a jurisdiction requiring opt-in consent).
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li>
                  <strong>Browser settings:</strong> Most browsers allow you to refuse or delete cookies.
                  Consult your browser&rsquo;s help documentation for instructions.
                </li>
                <li>
                  <strong>Cookie consent banner:</strong> If displayed, you can manage your preferences
                  directly through the banner or by clicking the &ldquo;Cookie Settings&rdquo; link in our footer.
                </li>
                <li>
                  <strong>Opt-out links:</strong> Some analytics providers offer opt-out mechanisms on their websites.
                </li>
              </ul>
              <p className="leading-relaxed text-white/80 mt-4">
                <strong>Please note:</strong> Disabling certain cookies may limit your ability to use some
                features of the Site.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Your Privacy Rights */}
        <section id="your-rights" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            5. Your Privacy Rights (GDPR/CCPA)
          </h2>

          <p className="leading-relaxed mb-6">
            Depending on your location, you may have certain rights regarding your personal information.
            We are committed to honouring these rights in compliance with applicable data protection laws.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-brand-cyan font-['Outfit']">
                GDPR Rights (European Union Residents)
              </h3>
              <p className="leading-relaxed text-white/80 mb-4">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland,
                you have the following rights under GDPR:
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Access</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request a copy of the personal data we hold about you, along with
                    information about how we use it.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Rectification</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request that we correct any inaccurate or incomplete personal data we hold about you.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request deletion of your personal data in certain circumstances,
                    such as when the data is no longer necessary for the purposes for which it was collected.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Restriction of Processing</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request that we restrict processing of your personal data in certain
                    situations (e.g., while we verify the accuracy of disputed data).
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Data Portability</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to receive your personal data in a structured, commonly used, and
                    machine-readable format, and to transmit that data to another controller.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Object</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to object to our processing of your personal data based on legitimate
                    interests or for direct marketing purposes.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Withdraw Consent</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Where we rely on consent to process your personal data, you have the right to withdraw
                    that consent at any time. This will not affect the lawfulness of processing based on consent
                    before its withdrawal.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Lodge a Complaint</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to lodge a complaint with your local data protection authority if you
                    believe we have not handled your personal data properly.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-brand-cyan font-['Outfit']">
                CCPA Rights (California Residents)
              </h3>
              <p className="leading-relaxed text-white/80 mb-4">
                If you are a California resident, you have the following rights under the California Consumer
                Privacy Act (CCPA):
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Know</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request information about the categories and specific pieces of
                    personal information we have collected about you, as well as the categories of sources,
                    business purposes, and third parties with whom we share your data.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Delete</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to request deletion of your personal information, subject to certain exceptions.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Opt-Out of Sale</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right to opt out of the &ldquo;sale&rdquo; of your personal information.
                    <strong> We do not sell your personal information.</strong>
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2">Right to Non-Discrimination</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    You have the right not to be discriminated against for exercising any of your CCPA rights.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-brand-cyan/10 rounded-xl border border-brand-cyan/30">
                <h4 className="font-semibold mb-2 text-brand-cyan">Do Not Sell My Personal Information</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  As stated above, we do not sell, rent, or trade your personal information to third parties.
                  If our practices change in the future, we will update this Privacy Policy and provide you
                  with an opt-out mechanism as required by law.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-brand-cyan font-['Outfit']">
                How to Exercise Your Rights
              </h3>
              <p className="leading-relaxed text-white/80 mb-4">
                To exercise any of the rights described above, please contact us using the information provided
                in the <a href="#contact" className="text-brand-cyan hover:underline">Contact Information</a> section below.
              </p>
              <p className="leading-relaxed text-white/80 mb-4">
                When submitting a request, please include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li>Your full name and email address</li>
                <li>A clear description of your request (e.g., &ldquo;Right to Access&rdquo;, &ldquo;Right to Erasure&rdquo;)</li>
                <li>Any additional information needed to verify your identity</li>
              </ul>
              <p className="leading-relaxed text-white/80 mt-4">
                We will respond to verified requests within the timeframes required by applicable law
                (typically 30 days for GDPR, 45 days for CCPA).
              </p>
            </div>
          </div>
        </section>

        {/* 6. Data Retention */}
        <section id="data-retention" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            6. Data Retention
          </h2>

          <p className="leading-relaxed mb-6">
            We retain your personal information only for as long as necessary to fulfil the purposes outlined
            in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Email Subscriptions
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                We retain your email address and related data until you unsubscribe or request deletion.
                After unsubscribing, we may retain a suppression record to honour your opt-out preference.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Pre-order Bonus Claims
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                We retain proof-of-purchase information and related correspondence for up to 12 months after
                the book launch date, or until you request deletion, whichever comes first.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Analytics Data
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Aggregated, anonymised analytics data may be retained indefinitely for business intelligence purposes.
                This data cannot be used to identify individual users.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Legal Obligations
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                We may retain certain data longer if required by law, to resolve disputes, enforce our agreements,
                or protect our legal rights.
              </p>
            </div>
          </div>

          <p className="leading-relaxed text-white/80 mt-6">
            When personal data is no longer needed, we will securely delete or anonymise it in accordance
            with industry best practices.
          </p>
        </section>

        {/* 7. Security Measures */}
        <section id="security" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            7. Security Measures
          </h2>

          <p className="leading-relaxed mb-6">
            We implement appropriate technical and organisational measures to protect your personal information
            against unauthorised access, alteration, disclosure, or destruction.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Technical Safeguards
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 text-sm">
                <li><strong>HTTPS encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS</li>
                <li><strong>Secure hosting:</strong> Our Site is hosted on secure, industry-standard cloud infrastructure</li>
                <li><strong>Access controls:</strong> Personal data is accessible only to authorised personnel who need it to perform their duties</li>
                <li><strong>Regular updates:</strong> We apply security patches and updates to our systems promptly</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Organisational Safeguards
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 text-sm">
                <li><strong>Data minimisation:</strong> We collect only the data necessary for our stated purposes</li>
                <li><strong>Third-party vetting:</strong> We carefully select service providers with strong security practices</li>
                <li><strong>Incident response:</strong> We have procedures in place to detect, respond to, and notify affected parties of data breaches as required by law</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Your Responsibility
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                While we take security seriously, no method of transmission over the Internet or electronic
                storage is 100% secure. Please take steps to protect your own information, such as using
                strong passwords and keeping your contact information up to date.
              </p>
            </div>
          </div>

          <p className="leading-relaxed text-white/80 mt-6">
            If you have reason to believe that your interaction with us is no longer secure (e.g., if you feel
            that your personal data has been compromised), please contact us immediately using the details in
            the <a href="#contact" className="text-brand-cyan hover:underline">Contact Information</a> section.
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section id="children" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            8. Children&rsquo;s Privacy
          </h2>

          <p className="leading-relaxed mb-4">
            Our Site is not directed to individuals under the age of 16. We do not knowingly collect personal
            information from children under 16.
          </p>
          <p className="leading-relaxed mb-4">
            If you are a parent or guardian and believe that your child has provided us with personal information,
            please contact us using the information in the{' '}
            <a href="#contact" className="text-brand-cyan hover:underline">Contact Information</a> section.
            We will take steps to delete such information from our systems promptly.
          </p>
          <p className="leading-relaxed text-white/80">
            If we learn that we have collected personal information from a child under 16 without parental consent,
            we will delete that information as quickly as possible.
          </p>
        </section>

        {/* 9. International Data Transfers */}
        <section id="international" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            9. International Data Transfers
          </h2>

          <p className="leading-relaxed mb-6">
            Your personal information may be transferred to, stored, and processed in countries other than
            your country of residence, including the United States and other jurisdictions where our service
            providers operate.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Data Protection Safeguards
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                When we transfer personal data from the European Economic Area (EEA), United Kingdom, or
                Switzerland to other countries, we ensure appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 text-sm">
                <li><strong>Standard Contractual Clauses (SCCs):</strong> Approved by the European Commission</li>
                <li><strong>Adequacy decisions:</strong> Transfers to countries deemed to provide adequate data protection</li>
                <li><strong>Binding corporate rules:</strong> For transfers within corporate groups</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-brand-cyan mb-2 font-['Outfit']">
                Your Rights
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Regardless of where your data is processed, you retain the privacy rights described in this
                Privacy Policy. If you have questions about international transfers, please contact us using
                the information in the <a href="#contact" className="text-brand-cyan hover:underline">Contact Information</a> section.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Changes to This Privacy Policy */}
        <section id="changes" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            10. Changes to This Privacy Policy
          </h2>

          <p className="leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, legal requirements, or other factors.
          </p>
          <p className="leading-relaxed mb-4">
            When we make material changes, we will:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
            <li>Update the &ldquo;Last updated&rdquo; date at the top of this page</li>
            <li>Notify you via email (if you have subscribed to our mailing list)</li>
            <li>Display a prominent notice on the Site</li>
          </ul>
          <p className="leading-relaxed mt-4 text-white/80">
            We encourage you to review this Privacy Policy periodically. Your continued use of the Site after
            any changes indicates your acceptance of the updated policy.
          </p>
        </section>

        {/* 11. Contact Information */}
        <section id="contact" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-6 font-['Outfit']">
            11. Contact Information
          </h2>

          <p className="leading-relaxed mb-6">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
            please contact us:
          </p>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
            <div>
              <h3 className="font-semibold mb-1 text-brand-cyan font-['Outfit']">By Email</h3>
              <a href="mailto:privacy@ai-born.org" className="text-brand-porcelain hover:text-brand-cyan transition-colors">
                privacy@ai-born.org
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-brand-cyan font-['Outfit']">By Post</h3>
              <address className="not-italic text-white/80">
                Mic Press, LLC<br />
                Attn: Privacy Officer<br />
                [Address to be provided]<br />
                New York, NY [ZIP]<br />
                United States
              </address>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white/80 text-sm leading-relaxed">
                For media inquiries, speaking requests, or general questions about the book, please visit
                our <a href="/#contact" className="text-brand-cyan hover:underline">Contact section</a> on the main site.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-brand-ember/10 rounded-xl border border-brand-ember/30">
            <p className="text-white/80 text-sm leading-relaxed">
              <strong className="text-brand-ember">Response Time:</strong> We aim to respond to all privacy
              requests within 30 days (or sooner as required by applicable law). For urgent matters, please
              indicate &ldquo;URGENT&rdquo; in your email subject line.
            </p>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-center text-white/80 leading-relaxed">
            Thank you for trusting Mic Press, LLC with your information. We are committed to protecting
            your privacy and providing transparency about our data practices.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>
              &copy; {new Date().getFullYear()} Mic Press, LLC. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/terms" className="hover:text-brand-cyan transition-colors">
                Terms of Service
              </a>
              <a href="/" className="hover:text-brand-cyan transition-colors">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
