// components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../Header/Header';
import MessageBubble from '../MessageBubble/MessageBubble';

const DashboardLayout = () => {
    return (
        <div className="AppGlass">
             <Header />
            <Sidebar />
           
            <main>
                {/* Outlet pour afficher les composants enfants */}
                <Outlet />
            </main>
            <MessageBubble />
        </div>
    );
};

export default DashboardLayout;