import React from 'react';
import { Navigate } from 'react-router-dom';

const DeliveryProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('deliveryPartnerToken');
    if (!token) {
        return <Navigate to="/delivery/login" />;
    }
    return children;
};

export default DeliveryProtectedRoute;