import React, { useEffect, useState } from 'react';
import './Customers.css';
import { fetchUsers, detectActivity, deleteUser, updateLastActive } from '../../../Services/UserService';
import { fetchFilesCount } from '../../../Services/FileService';
import Swal from 'sweetalert2';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [filesCount, setFilesCount] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des utilisateurs
        const users = await fetchUsers();
        setDevelopers(users);

        // Récupération des fichiers par utilisateur
        const filesData = await fetchFilesCount();
        console.log('Files Count Data:', filesData);
        setFilesCount(filesData);

      } catch (error) {
        console.error('Erreur lors du chargement des données :', error.message);
      }
    };

    fetchData();
  }, []);

  // Filtrer les développeurs en fonction de la recherche
  const filteredDevelopers = developers.filter(dev =>
    dev.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trouver le nombre de fichiers pour chaque utilisateur
  const getFilesCountForUser = (userId) => {
    if (!filesCount || filesCount.length === 0) return 0; // Si filesCount est vide, retourner 0

    const userFile = filesCount.find(fileData => {
      if (!fileData || !fileData.userId) return false; // Ignorer les éléments invalides
      return String(fileData.userId) === String(userId); // Comparer les ID sous forme de chaînes
    });

    return userFile ? userFile.totalFiles : 0;
  };
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        setDevelopers(developers.filter(dev => dev._id !== userId));

        Swal.fire(
          "Deleted!",
          "The user has been successfully deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error!",
          "Failed to delete the user.",
          "error"
        );
        console.error("Erreur lors de la suppression de l'utilisateur :", error.message);
      }
    }
  };

  const handleUserActivity = async (userId) => {
    try {
        const response = await updateLastActive(userId); // Appelle l'API
        if (!response || !response.lastActive) {
          throw new Error("Invalid response from server");
      }

      setDevelopers(prevDevelopers =>
        prevDevelopers.map(dev =>
            dev._id === userId ? { ...dev, lastActive: response.lastActive } : dev
        )
    );
        Swal.fire({
            icon: 'success',
            title: `Last Activity: ${new Date(response.lastActive).toLocaleString()}`,
            showConfirmButton: false,
            timer: 3000
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Failed to update user activity',
            text: error.message,
        });
    }
};


  return (
    <div className="developers-list">
      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search a developer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tableau des développeurs */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Admin status</th>
            <th>Last activity</th>
            <th>Total files created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevelopers.length > 0 ? (
            filteredDevelopers.map(dev => (
              <tr key={dev._id}>
                <td>{dev.name}</td>
                <td>{dev.role}</td>
                <td>
                  {dev.lastActive ? new Date(dev.lastActive).toLocaleString() : 'N/A'}
                </td>
                <td>{getFilesCountForUser(dev._id)}</td>
                <td>
                  <button className='deleteBtn' onClick={() => handleDeleteUser(dev._id)}>Delete</button> </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Aucun développeur trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;