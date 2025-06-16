import React from 'react';
import { motion } from 'framer-motion';

export default function Privacy() {
    const sections = [
        {
            title: 'Information We Collect',
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium">Personal Information:</span> Name, email, phone number, date of birth, profile info.</li>
                    <li><span className="font-medium">Usage Information:</span> IP address, device info, browser type, log data.</li>
                    <li><span className="font-medium">Location Information:</span> If you choose to share your location.</li>
                    <li><span className="font-medium">Content:</span> Messages and other information you share on Series.</li>
                </ul>
            )
        },
        {
            title: 'How We Use Information',
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage your account.</li>
                    <li>Provide and improve the Services.</li>
                    <li>Match you with other users.</li>
                    <li>Communicate with you about updates and promotions.</li>
                    <li>Maintain safety and security.</li>
                </ul>
            )
        },
        {
            title: 'Sharing Information',
            content: (
                <>
                    <p className="mb-4">We do not sell your personal information. We may share it with:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Service providers who help us operate the Services.</li>
                        <li>Law enforcement or government authorities if required by law or to protect our rights, property, or the safety of others.</li>
                        <li>Other users as part of matching features (e.g., basic profile information).</li>
                    </ul>
                </>
            )
        },
        {
            title: 'Age Restriction and COPPA',
            content: (
                <div className="space-y-4">
                    <p>The Services are intended for adults age 18 and older only. We do not knowingly collect or solicit personal information from anyone under the age of 18.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Children's Online Privacy Protection Act (COPPA):</h3>
                        <p className="text-gray-700">
                            Series complies with the Children's Online Privacy Protection Act. We do not knowingly collect or maintain personal information from children under 13. If we discover that we have inadvertently collected information from a child under 13, we will delete it immediately. If you believe we may have collected information from a child under 13, please contact us right away at{' '}
                            <a href="mailto:admin@series.so" className="text-blue-600 hover:underline">admin@series.so</a>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'Security',
            content: 'We use reasonable safeguards to protect your information. However, no system is completely secure. Please use caution and good judgment when sharing information online.'
        },
        {
            title: 'Your Choices',
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Update your account information at any time.</li>
                    <li>Request that we delete your account and associated data by contacting us.</li>
                </ul>
            )
        },
        {
            title: 'Changes',
            content: 'We may update this Privacy Policy from time to time. We will post any changes with a new "Last updated" date. Your continued use means you accept the updated policy.'
        },
        {
            title: 'Contact',
            content: (
                <p>
                    If you have questions or concerns about this Privacy Policy or our practices, please contact us at:{' '}
                    <a href="mailto:admin@series.so" className="text-blue-600 hover:underline">admin@series.so</a>
                </p>
            )
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Last updated: June 15th, 2025</p>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-700 mb-8">
                        This Privacy Policy explains how The Founder Series, Inc. ("Series", "we", "us", "our") collects, uses, and protects your information when you use our website, mobile app, and related services (the "Services").
                    </p>

                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <section key={index} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{index + 1}. {section.title}</h2>
                                <div className="text-gray-700 leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}