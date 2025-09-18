import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="flex-grow bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto text-center bg-white p-12 rounded-xl shadow-md">
                <CheckCircle className="mx-auto text-green-500 h-20 w-20" />
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
                <p className="text-gray-600 mt-2">Thank you for your purchase. We'll notify you once it ships.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => navigate('/')} className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors">
                        Continue Shopping
                    </button>
                    <button onClick={() => navigate('/account')} className="inline-block bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors">
                        View Orders
                    </button>
                </div>
            </div>
        </div>
    );
}