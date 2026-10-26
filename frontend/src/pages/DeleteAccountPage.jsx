import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Mail, Phone, Send, User, UserRoundX } from 'lucide-react';

const initialFormData = {
    full_name: '',
    registered_email: '',
    registered_mobile_number: '',
    reason_for_deletion: '',
};

export default function DeleteAccountPage() {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
        setStatus(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/inquiry`, {
                inquiryType: 'Delete Account',
                formData,
            });
            setStatus({ type: 'success', message: response.data.msg });
            setFormData(initialFormData);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.msg || 'We could not submit your request. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-12 sm:py-16">
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-10"
            >
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <UserRoundX size={32} />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">Sresta Mart — Delete Account</h1>
                    <p className="mt-3 text-gray-600">
                        Submit a request to delete your account and associated personal information.
                    </p>
                </div>

                <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p>
                        This form sends an account deletion request to Sresta Mart for review. Submitting
                        it does not immediately delete your account. Some information may need to be
                        retained where required by law or for legitimate operational purposes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-gray-700">
                            Full name <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                autoComplete="name"
                                required
                                maxLength={120}
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="registered_email" className="mb-1 block text-sm font-medium text-gray-700">
                            Registered email address <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
                            <input
                                id="registered_email"
                                name="registered_email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={254}
                                value={formData.registered_email}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="registered_mobile_number" className="mb-1 block text-sm font-medium text-gray-700">
                            Registered mobile number <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
                            <input
                                id="registered_mobile_number"
                                name="registered_mobile_number"
                                type="tel"
                                autoComplete="tel"
                                required
                                maxLength={30}
                                value={formData.registered_mobile_number}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reason_for_deletion" className="mb-1 block text-sm font-medium text-gray-700">
                            Reason for deletion <span className="font-normal text-gray-500">(optional)</span>
                        </label>
                        <textarea
                            id="reason_for_deletion"
                            name="reason_for_deletion"
                            rows="4"
                            maxLength={1000}
                            value={formData.reason_for_deletion}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={18} />
                        {isSubmitting ? 'Submitting request...' : 'Submit deletion request'}
                    </button>

                    {status && (
                        <p
                            role="status"
                            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                                status.type === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {status.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
                            {status.message}
                        </p>
                    )}
                </form>
            </motion.main>
        </div>
    );
}
