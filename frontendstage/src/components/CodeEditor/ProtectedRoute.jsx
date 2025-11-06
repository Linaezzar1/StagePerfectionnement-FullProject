import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const { isLogged } = useSelector((state) => state);

    return isLogged ? <Component {...rest} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
