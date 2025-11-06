import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/message'; 

export const getAllMessages = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getmessage`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }
};

export const createMessage = async (content, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/createmessage`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    throw error;
  }
};
