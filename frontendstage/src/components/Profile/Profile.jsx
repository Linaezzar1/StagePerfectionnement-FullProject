import React, { useEffect, useState } from 'react'
import './Profile.css'
import axios from 'axios';
import { fetchCurrentUser } from '../../Services/UserService';

const Profile = () => {
   

    const [user, setUser] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        // Fonction pour récupérer les informations de l'utilisateur
        const fetchUserData = async () => {
          try {
            const userData = await fetchCurrentUser(); // Utiliser le service pour récupérer les données utilisateur
            setUser(userData); // Mettre à jour l'état avec les données de l'utilisateur
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
    
        fetchUserData(); // Appeler la fonction au chargement du composant
      }, []);
    return (
        <div className="profile-page">
            
            <h1>User Profile</h1>
            <div className="profile-info">
                <div className="info-item">
                    <label htmlFor="Firstname">Username:  </label>
                    <input type="text" value={user.name} readOnly />
                </div>
                <div className="info-item">
                    <label htmlFor="Email">Email:  </label>
                    <input type="email" value={user.email} readOnly />
                </div>
            </div>
        </div>
    )
}

export default Profile
