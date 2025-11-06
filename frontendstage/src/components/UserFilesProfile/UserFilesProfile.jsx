import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteFile, getAllFilesByUserId } from '../../Services/FileService';
import { MdDownload } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import './UserFilesProfile.css'

const UserFilesProfile = ({ userId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await getAllFilesByUserId(userId); // Utilisez getAllFilesByUserId
                setFiles(data);
            } catch (error) {
                console.error('Erreur lors de la récupération des fichiers :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [userId]);

    const handleDownload = async (content, language) => {
        let fileExtension = '';
        let mimeType = '';

        // Déterminer l'extension et le type MIME en fonction du langage
        switch (language.toLowerCase()) {
            case 'javascript':
                fileExtension = '.js';
                mimeType = 'application/javascript';
                break;
            case 'python':
                fileExtension = '.py';
                mimeType = 'text/x-python';
                break;
            case 'java':
                fileExtension = '.java';
                mimeType = 'text/x-java-source';
                break;
            case 'csharp':
                fileExtension = '.cs';
                mimeType = 'text/x-csharp';
                break;
            case 'typescript':
                fileExtension = '.ts';
                mimeType = 'application/typescript';
                break;
            case 'php':
                fileExtension = '.php';
                mimeType = 'application/x-httpd-php';
                break;
            default:
                fileExtension = '.txt';  // Par défaut, si le langage n'est pas reconnu
                mimeType = 'text/plain';
                break;
        }

        // Créer un Blob à partir du contenu
        const blob = new Blob([content], { type: mimeType });

        // Créer une URL pour le Blob
        const url = URL.createObjectURL(blob);

        // Créer un élément <a> pour simuler un clic pour télécharger
        const link = document.createElement('a');
        link.href = url;
        link.download = `file${fileExtension}`;  // Nom dynamique selon le langage

        // Déclencher le téléchargement en simulant un clic sur le lien
        link.click();

        // Libérer l'URL après le téléchargement
        URL.revokeObjectURL(url);
    };





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
        <div className="UserFiles">

            {/* Search Bar */}

            <div className="Search-bar-User">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Files List */}
            <div className="UserFiles-list">
                {filteredFiles.length > 0 ? (
                    filteredFiles.map(file => (
                        <div className="UserFile-item">
                            <div className="file-name">{file.name}</div>
                            <div className="file-details">
                                <div className="file-actions">

                                    <button className='btnEdit' onClick={() => handleEdit(file)}>Edit</button>
                                    <button className='btnDelete' onClick={() => handleDelete(file._id)}>Delete</button>
                                    <MdDownload className='btnSave' onClick={() => handleDownload(file.content, file.language)} />
                                </div>
                            </div>

                        </div>
                    ))
                ) : (
                    <p>Aucun fichier trouvé.</p>
                )}
            </div>
            <div className='iconContainer' onClick={() => navigate('/editor')} >
                Go to editor
                <FaEdit className='iconLogout' />
            </div>
            

        </div>
    )
}

export default UserFilesProfile
