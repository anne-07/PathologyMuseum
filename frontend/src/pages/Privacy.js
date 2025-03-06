import React from 'react';

export default function Privacy() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <div className="mt-6 space-y-6 text-gray-500">
            <p className="text-base">Last updated: March 5, 2025</p>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
              <p className="mt-4">
                Digital Pathology Museum ("we," "our," or "us") respects your privacy and is committed to
                protecting your personal data. This privacy policy explains how we collect, use, and
                safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>Account information (name, email, institution)</li>
                <li>Usage data (viewing history, bookmarks, notes)</li>
                <li>Technical data (IP address, browser type, device information)</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To personalize your experience</li>
                <li>To improve our platform</li>
                <li>To communicate with you</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">4. Data Security</h2>
              <p className="mt-4">
                We implement appropriate security measures to protect your personal information. However,
                no method of transmission over the internet is 100% secure, and we cannot guarantee
                absolute security.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">5. Your Rights</h2>
              <p className="mt-4">
                You have the right to:
              </p>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">6. Contact Us</h2>
              <p className="mt-4">
                If you have any questions about this Privacy Policy, please contact us at:
                privacy@digitalpathologymuseum.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
