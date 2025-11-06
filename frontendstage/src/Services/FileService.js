// FileService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Remplacez par l'URL de votre backend

// Récupérer les fichiers créés par mois
export const getCreatedFilesStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/countByMonth`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching created files stats:', error);
    return [];
  }
};

// Récupérer les fichiers modifiés par mois
export const getModifiedFilesStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/modifiedStats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching modified files stats:', error);
    return [];
  }
};

// Récupérer tous les fichiers
export const getAllFiles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/getFiles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Si l'authentification est requise
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers :', error);
    throw error;
  }
};


// Supprimer un fichier
export const deleteFile = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/file/deleteFile/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Si l'authentification est requise
      },
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier :', error);
    throw error;
  }
};

// Mettre à jour un fichier
export const updateFile = async (id, content) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/file/updateFile/${id}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Si l'authentification est requise
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fichier :', error);
    throw error;
  }
};

// Ajouter un nouveau fichier
export const addFile = async (name, content, language) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/file/addFile`,
      { name, content, language },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Si l'authentification est requise
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du fichier :', error);
    throw error;
  }
};

export const getAllFilesByUserId = async () => {
  try {
      const response = await axios.get(`${API_BASE_URL}/file/getUserFiles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log("Réponse complète de l'API:", response);
      return response.data;
  } catch (error) {
      console.error('Erreur lors de la récupération des fichiers :', error);
      throw error;
  }
};


// Récupérer les fichiers créés cette semaine
export const getCreatedFilesThisWeek = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/getCreatedFiles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.totalFiles;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers créés cette semaine :', error);
    return 0;
  }
};

// Récupérer les fichiers modifiés cette semaine
export const getModifiedFilesThisWeek = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/getModifiedFiles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.totalFiles;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers modifiés cette semaine :', error);
    return 0;
  }
};



// Ajouter le token JWT automatiquement dans les requêtes
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Service pour récupérer le nombre de fichiers par utilisateur
export const fetchFilesCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/countByUser`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data; // Assurez-vous que response.data est un tableau
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de fichiers par utilisateur :', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};  

export const fetchFilesCreatedByDay = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/filesperday`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data; // Assurez-vous que response.data est un tableau
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de fichiers créés par jour :", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

export const fetchFilesModifiedByDay = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/modifiedperday`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data; // Assurez-vous que response.data est un tableau
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de fichiers modifiés par jour :", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};






