import React, { useEffect, useState } from 'react'
import './Files.css';
import { useNavigate } from 'react-router-dom';
import { getAllFiles , deleteFile } from '../../../Services/FileService'; 
import Swal from 'sweetalert2';

const Files = () => {

  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await getAllFiles();
        setFiles(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des fichiers :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this file!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await deleteFile(id);
        setFiles(files.filter((file) => file._id !== id));

        Swal.fire(
          "Deleted!",
          "The file has been successfully deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error!",
          "Failed to delete the file.",
          "error"
        );
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleEdit = (file) => {
    navigate('/editor', { state: { file } });
  };

  

  // Filtrer les fichiers par recherche
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Chargement des fichiers...</div>;
  }


  return (
    <div className="files">
     
       {/* Search Bar */}
       
       <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Files List */}
      <div className="files-list">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <div  className="file-item">
              <div className="file-name">{file.name}</div>
              <div className="file-details">
                <span>Updated At : {file.updatedAt}</span>
                <span>Created By: {file.userId?.name || 'User'}</span>
                <div className="file-actions">
                <button className='btnEdit' onClick={() => handleEdit(file)}>Edit</button>
                <button className='btnDelete' onClick={() => handleDelete(file._id)}>Delete</button>
              </div>
              </div>
              
            </div>
          ))
        ) : (
          <p>Aucun fichier trouvé.</p>
        )}
      </div>

    </div>
  )
}

export default Files
