import React from 'react';
import { APP_NAME } from '../constants';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> July 10, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using {APP_NAME}, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                {APP_NAME} is an online platform that connects property owners, agents, and tenants 
                in Kenya. We provide tools for listing properties, searching rentals, and facilitating 
                communication between parties involved in rental transactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Registration</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Security</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Post false, misleading, or fraudulent property listings</li>
                <li>Use the platform for any illegal activities</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious software or spam content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Discriminate based on race, religion, gender, or other protected characteristics</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Property Listings</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All property information must be accurate and up-to-date</li>
                <li>You must have legal authority to list the property</li>
                <li>Images must accurately represent the property</li>
                <li>Pricing must be clearly stated and honest</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Platform Policies</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Agent Verification</h3>
              <p className="text-gray-700 mb-4">
                Property agents must complete our verification process to access enhanced features. 
                Verification does not constitute an endorsement of the agent's services.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Content Moderation</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to review, edit, or remove any content that violates these terms 
                or our community standards. This includes property listings, user profiles, and communications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fees and Payments</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Basic platform usage is free for tenants</li>
                <li>Premium features for agents may require subscription fees</li>
                <li>All fees are clearly disclosed before purchase</li>
                <li>Payments are processed securely through third-party providers</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The {APP_NAME} platform, including its design, features, and content, is protected by 
                copyright and other intellectual property laws. Users retain rights to their uploaded 
                content but grant us a license to use it for platform operations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 Platform Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to maintain platform availability but cannot guarantee uninterrupted service. 
                We may temporarily suspend the service for maintenance or updates.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Third-Party Content</h3>
              <p className="text-gray-700 mb-4">
                We are not responsible for the accuracy of user-generated content, including property 
                listings. Users should verify all information independently before making decisions.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">8.3 Rental Transactions</h3>
              <p className="text-gray-700 mb-4">
                {APP_NAME} facilitates connections between parties but is not party to rental agreements. 
                Users are responsible for their own rental transactions and agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, {APP_NAME} shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to 
                loss of profits, data, or use, incurred by you or any third party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy to understand how 
                we collect, use, and protect your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend accounts that violate these terms. 
                You may terminate your account at any time by contacting us. Upon termination, 
                your right to use the platform ceases immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of Kenya. Any disputes arising from these terms 
                or platform usage shall be resolved in Kenyan courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms periodically. Significant changes will be communicated to 
                users via email or platform notifications. Continued use after changes constitutes 
                acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@rentifykenya.com</p>
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

export default TermsOfServicePage;
