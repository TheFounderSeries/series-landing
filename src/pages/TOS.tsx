import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function TOS() {
    const [showOriginal, setShowOriginal] = useState(false);
    const toggleOriginal = () => setShowOriginal(!showOriginal);
    const sections = [
        {
            title: 'Eligibility',
            content: 'You must be at least 18 years old to use Series. By creating an account, you confirm that you are 18 or older and that all information you provide is truthful and accurate.'
        },
        {
            title: 'Account Responsibilities',
            content: 'You agree to keep your login information secure and not share your account. You are fully responsible for all activity under your account.'
        },
        {
            title: 'Prohibited Conduct',
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Impersonate any person or misrepresent your age or identity.</li>
                    <li>Attempt to contact or exploit any user unlawfully.</li>
                    <li>Use the Services to harass, harm, or abuse others.</li>
                    <li>Circumvent any safety or age verification measures.</li>
                    <li>Share false, illegal, or harmful content.</li>
                </ul>
            )
        },
        {
            title: 'Privacy',
            content: (
                <>
                    Your use of Series is also governed by our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your data. By using our Services, you agree to that policy.
                </>
            )
        },
        {
            title: 'Safety & Content',
            content: 'Series helps people connect but does not guarantee or verify user identities. You are solely responsible for your interactions with other users. Exercise caution, use good judgment, and never share sensitive personal information with strangers. We disclaim all liability for user conduct, online and offline.'
        },
        {
            title: 'Location & In-Person Meetings',
            content: 'If you choose to share your location or meet someone, you do so entirely at your own risk. Series is not responsible for any harm resulting from your interactions.'
        },
        {
            title: 'Termination',
            content: 'We may suspend or terminate your account at any time if you violate these Terms or pose a risk to others.'
        },
        {
            title: 'No Warranties',
            content: 'Series is provided "as is" and "as available" without warranties of any kind.'
        },
        {
            title: 'Limitation of Liability',
            content: 'To the fullest extent permitted by law, Series and its officers, directors, employees, and agents will not be liable for any indirect, incidental, consequential, or punitive damages, or any loss of data, use, or goodwill, arising from your use of the Services.'
        },
        {
            title: 'Indemnification',
            content: 'You agree to indemnify and hold harmless Series and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Services or violation of these Terms.'
        },
        {
            title: 'Changes',
            content: 'We may update these Terms at any time. Changes will be posted here with a new "Last updated" date. Continuing to use the Services means you accept the changes.'
        },
        {
            title: 'Governing Law',
            content: 'These Terms are governed by the laws of New York State, without regard to conflict of laws principles. Disputes will be resolved exclusively in New York State courts.'
        },
        {
            title: 'Contact',
            content: (
                <p>
                    For questions, contact us at:{' '}
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
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-600 mb-4">Last updated: June 17th, 2025</p>
                </div>

                <div className="w-full h-[80vh]">
                    <iframe 
                        src="/The%20Founder%20Series_Terms%20of%20Service.pdf" 
                        className="w-full h-full border-0"
                        title="Terms of Service"
                    >
                        <p>Your browser does not support PDFs. 
                            <a href="/The%20Founder%20Series_Terms%20of%20Service.pdf">Download the Terms of Service</a>.
                        </p>
                    </iframe>
                </div>
            </div>
        </motion.div>
    );
}