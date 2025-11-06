import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Remplacez par l'URL de votre backend

// Ajouter le token JWT automatiquement dans les requêtes
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Service pour récupérer les utilisateurs
export const fetchUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/user/all`, {
    headers: getHeaders(),
  });
  return response.data;
};



export const fetchCurrentUser = async () => {
    const response = await axios.get(`${API_BASE_URL}/user/currentUser`, {
      headers: getHeaders(),
    });
    return response.data;
  };


// Service pour supprimer un utilisateur
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/user/deleteUser`, {
      headers: getHeaders(),
      data: { userId }  // Envoi de l'ID de l'utilisateur dans le corps de la requête
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error.message);
    throw error;
  }
};

export const updateLastActive = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user/activity`, { userId }, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité utilisateur :', error.message);
    throw error;
  }
};
  


  