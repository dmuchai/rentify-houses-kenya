import React from 'react';
import { APP_NAME } from '../constants';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> July 10, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to {APP_NAME}. We are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our rental property platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name, email address, and phone number</li>
                <li>Profile information and verification documents</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communication preferences and history</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Property Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Property listings, descriptions, and images</li>
                <li>Location data and property features</li>
                <li>Rental history and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Technical Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP address, browser type, and device information</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>To provide and improve our rental platform services</li>
                <li>To facilitate property searches and listings</li>
                <li>To verify user identities and prevent fraud</li>
                <li>To process payments and manage transactions</li>
                <li>To send important notifications and updates</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To analyze usage patterns and improve user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>With property agents and landlords for legitimate rental purposes</li>
                <li>With service providers who assist in operating our platform</li>
                <li>When required by law or legal process</li>
                <li>To protect the rights and safety of our users and platform</li>
                <li>In connection with business transfers or acquisitions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. However, 
                no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information (subject to legal requirements)</li>
                <li>Restrict or object to certain processing activities</li>
                <li>Data portability where technically feasible</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, 
                and provide personalized content. You can manage cookie preferences through your 
                browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for individuals under 18 years of age. We do not 
                knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant 
                changes by posting the updated policy on our platform and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@rentifykenya.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +254 700 123 456</p>
                <p className="text-gray-700"><strong>Address:</strong> Nairobi, Kenya</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
