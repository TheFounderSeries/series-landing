import { motion } from 'framer-motion';

export default function TermsOfUse() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
                    <p className="text-gray-600">Last updated: June 17th, 2025</p>
                </div>

                <div className="w-full h-[80vh]">
                    <iframe 
                        src="/The%20Founder%20Series_Terms%20of%20Use.pdf" 
                        className="w-full h-full border-0"
                        title="Terms of Use"
                    >
                        <p>Your browser does not support PDFs. 
                            <a href="/The%20Founder%20Series_Terms%20of%20Use.pdf">Download the Terms of Use</a>.
                        </p>
                    </iframe>
                </div>
            </div>
        </motion.div>
    );
}
