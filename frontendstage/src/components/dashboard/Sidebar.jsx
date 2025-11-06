import React, { useState } from 'react';
import './Sidebar.css';
import { SidebarData } from '../data/Data';
import { UilSignOutAlt } from "@iconscout/react-unicons";
import { useNavigate } from 'react-router-dom';
import logo from '../../imgs/logo.png'

const Sidebar = () => {
    const [selected, setSelected] = useState(0); // État pour suivre l'élément sélectionné
    const navigate = useNavigate(); // Initialisation de useNavigate

    return (
        <div className='Sidebar'>
            {/* Logo Section */}
            <div className='logo'>
                <img src={logo} alt='' />
                <span> <span> EY </span> Editor </span>
            </div>

            {/* Menu Items */}
            <div className='menu'>
                {SidebarData.map((item, index) => {
                    return (
                        <div
                            className={selected === index ? "menuItem active" : "menuItem"} // Appliquer le style actif si l'index correspond
                            key={index}
                            onClick={() => {
                                setSelected(index); // Mettre à jour l'élément sélectionné
                                navigate(item.path); // Naviguer vers le chemin défini dans SidebarData
                            }}
                        >
                            <item.icon />
                            <span>{item.heading}</span>
                        </div>
                    );
                })}

                {/* Sign Out Button */}
                <div className="menuItem" onClick={() => navigate('/editor')}>
                    <UilSignOutAlt />
                    <span>GO TO EDITOR</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;