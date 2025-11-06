import React from 'react';
import './Header.css';
import { Box, IconButton } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { Dropdown } from 'react-bootstrap';
import { CgProfile } from "react-icons/cg";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlineAnalytics } from "react-icons/md";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';

const Header = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');

    // Décoder le token pour obtenir les informations de l'utilisateur
    const decodedToken = token ? jwtDecode(token) : null;
    const userRole = decodedToken?.role;


    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };


    return (
        <div className='boxContainer'>
            <Box display="flex" justifyContent="space-between" p={2} >
                {/* SEARCH BAR */}
                <Box
                    display="flex"
                    borderRadius="3px"
                >
                </Box>

                {/* ICONS */}
                <Box display="flex" sx={{ marginLeft: 'auto', gap: '8px' }}>


                    {/* User Icon with Dropdown */}
                    <Dropdown>
                        <Dropdown.Toggle as={IconButton} id="dropdown-user">
                            <PersonOutlinedIcon />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className='dropdown-menu'>
                            <Dropdown.Item onClick={ ()=>  navigate('/profile') }> <CgProfile /> My Profile </Dropdown.Item>
                            
                            {userRole === 'admin' && (
                                <Dropdown.Item onClick={() => navigate('/dashboard/maindash')}>
                                    <MdOutlineDashboard /> Dashboard
                                </Dropdown.Item>
                            )}
                            
                            
                            <Dropdown.Item onClick={ ()=>  navigate('/mainAnalytics') }> <MdOutlineAnalytics /> Analytics</Dropdown.Item>
                            <Dropdown.Item onClick={handleLogout} className='logout-menu'><LuLogOut className='icon-logout' /> Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Box>
            </Box>
        </div>
    );
};

export default Header;