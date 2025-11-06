import React, { useEffect, useState } from 'react'
import './Dash.css'
import chart from '../../../imgs/chart-dynamic-premium.png'

import { fetchCurrentUser } from '../../../Services/UserService';



const Maindash = () => {

  const [currentUser, setCurrentUser] = useState(null); // State pour stocker les infos de l'utilisateur
  const [loading, setLoading] = useState(true); // State pour gérer le chargement

  // Fonction pour récupérer l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser(); // Utiliser la fonction de service
        setCurrentUser(user); // Mettre à jour le state avec les données de l'utilisateur
      } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur connecté :', error);
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    getCurrentUser();
  }, []);
  // Affichage pendant le chargement
  if (loading) {
      return <div>Loading...</div>; // Affichez un spinner ou un message de chargement
  }
  

  return (
    <div className='MainDash'>
       
       <main className="content px-3 py-2 ">
      <div className="container-fluid">
        
        <div className="row">
          <div className="col-12 d-flex">
            <div className="cardDahboard flex-fill border-0 illustration rounded">
              <div className="cardDahboard-body p-0 d-flex flex-fill">
                <div className="row g-0 w-100">
                  {/* Section gauche */}
                  <div className="col-6 d-flex justify-content-center align-items-center">
                    <div className="p-3 m-1">
                      <h4>Welcome Back, Admin</h4>
                      <p className="mb-0">
                        Admin Dashboard, {currentUser?.name || 'User'}
                      </p>
                    </div>
                  </div>
                  {/* Section droite */}
                  <div className="col-6">
                    <img
                      src={chart}
                      width="550"
                      className="img-fluid illustration-img"
                      alt="imgDash"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  )
}

export default Maindash
