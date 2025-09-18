import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Home, Briefcase } from 'lucide-react';

export default function ManageAddressPage({ addresses, setAddresses }) {
    const [label, setLabel] = useState('');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!label || !value) {
            setError("Both a label (e.g., Home) and an address are required.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const newAddress = { label, value };
            const res = await axios.post('http://localhost:4000/api/addresses', { newAddress }, {
                headers: { 'x-auth-token': token }
            });
            setAddresses(res.data); // Update parent state
            setLabel('');
            setValue('');
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to add address.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-grow bg-gray-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Addresses</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4">Add New Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Label</label>
                            <input type="text" placeholder="e.g., Home, Work" value={label} onChange={(e) => setLabel(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Address</label>
                            <textarea placeholder="123 Main Street, Ponnur, 522124" value={value} onChange={(e) => setValue(e.target.value)}
                                rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={isSubmitting}
                            className="w-full flex justify-center items-center bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400">
                            <PlusCircle size={20} className="mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Address'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Your Saved Addresses</h3>
                    <div className="space-y-4">
                        {addresses.length > 0 ? addresses.map((addr, index) => (
                            <div key={index} className="p-4 border rounded-md flex items-start">
                                {addr.label.toLowerCase() === 'home' ? <Home className="mr-4 mt-1 text-gray-500"/> : <Briefcase className="mr-4 mt-1 text-gray-500"/>}
                                <div>
                                    <p className="font-bold text-gray-800">{addr.label}</p>
                                    <p className="text-gray-600">{addr.value}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-500">You have no saved addresses.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}