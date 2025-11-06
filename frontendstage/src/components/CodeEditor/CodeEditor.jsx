import { Box, Button, HStack, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import LanguageSelector from '../CodeEditor/LanguageSelector';
import { CODE_SNIPPETS } from '../../constants';
import Output from '../CodeEditor/Output';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateFile, addFile } from '../../Services/FileService';
import { FaFileExport } from "react-icons/fa";

import { FaFastBackward } from "react-icons/fa";


const CodeEditor = () => {
  const location = useLocation();
  const [value, setValue] = useState('');
  const [language, setLanguage] = useState('javascript');
  const editorRef = useRef();
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const userId = "123";
  const toast = useToast();

  // Gestion de la modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileName, setFileName] = useState('');



  const handleEditorChange = (value) => {
    setValue(value); // Met à jour l'état local
    // Envoyer la modification via WebSocket
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ content: value }));
    }
  };

  // Mapping des extensions de fichiers aux langages
  const FILE_EXTENSION_TO_LANGUAGE = {
    '.js': 'javascript',
    '.py': 'python',
    '.ts': 'typescript',
    '.java': 'java',
    '.cs': 'csharp',
    '.php': 'php',
    // Ajoutez d'autres extensions et langages au besoin
  };



  const connectWebSocket = () => {
    socketRef.current = new WebSocket(`ws://localhost:3000?userId=${userId}`);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connecté avec succès');
    };

    socketRef.current.onerror = (error) => {
      console.error('Erreur WebSocket :', error);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && typeof data.content === 'string') {
          setValue(data.content);
        } else {
          console.warn('Données WebSocket invalides :', data);
        }
      } catch (error) {
        console.error('Erreur parsing WebSocket :', error);
      }
    };

    socketRef.current.onclose = (event) => {
      setIsConnected(false);
      console.warn(`WebSocket fermé (code: ${event.code}, raison: ${event.reason})`);
      setTimeout(connectWebSocket, 3000); // Reconnexion après 3 secondes
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);


  useEffect(() => {
    if (location.state?.file) {
      const { content } = location.state.file;
      setValue(content || '');
      setFile(location.state.file); // Conserve les infos du fichier
      setLanguage(location.state.file.language);


    }
  }, [location.state]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const handleSaveOrUpdate = async () => {
    if (!editorRef.current) {
      console.error("Editor non initialisé !");
      return;
    }
    const content = editorRef.current.getValue();
    setIsSaving(true);
    try {
      if (file) {
        const updatedFile = await updateFile(file._id, content, language);
        toast({
          title: "Fichier mis à jour",
          description: `Le fichier "${updatedFile.name}" a été mis à jour.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        onOpen(); // Ouvrir la modal pour entrer le nom du fichier
      }
    } catch (error) {
      console.error('Erreur :', error);
      toast({
        title: "Erreur",
        description: "Échec de la sauvegarde ou mise à jour.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSaveFile = async () => {
    if (!fileName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom de fichier valide.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const content = editorRef.current.getValue();
    setIsSaving(true);
    try {
      const newFile = await addFile(fileName, content, language);
      setFile(newFile);
      toast({
        title: "Fichier sauvegardé",
        description: `Le fichier "${newFile.name}" a été sauvegardé.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Erreur :', error);
      toast({
        title: "Erreur",
        description: "Échec de la sauvegarde du fichier.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setValue(content);

        // Extraire l'extension du fichier
        const fileName = file.name;
        const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

        // Déterminer le langage en fonction de l'extension
        const detectedLanguage = FILE_EXTENSION_TO_LANGUAGE[fileExtension] || 'plaintext';
        setLanguage(detectedLanguage);
      };
      reader.readAsText(file);
    }
  };
  const navigate = useNavigate();


  return (

    <Box>

      <Box textAlign="left" mb={4}>
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <HStack spacing={2} align="center" fontSize={20}>
            <FaFileExport />
            
          </HStack>
        </label>
        <Input
          type="file"
          accept=".js,.ts,.py,.java,.html,.php,.cs"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
      </Box>

      <HStack spacing={4}>

        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{
              minimap: { enabled: true },
              readOnly: false,
              contextmenu: true,
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => { setValue(value); handleEditorChange(value) }}
          />
        </Box>


        <Button colorScheme="blue" mt={4} onClick={handleSaveOrUpdate} isLoading={isSaving}>
          {file ? 'Update' : 'Save'}
        </Button>
        <Output editorRef={editorRef} language={language} />

      </HStack>

      <Box textAlign="center" mt={3} mb={4} ml={4} onClick={() => navigate('/UserFilePage')} >
        <label  style={{ cursor: 'pointer' }}>
          <HStack spacing={2} align="center" fontSize={20}>
          <FaFastBackward /> <Text mt={3}>Back to files</Text>
            
          </HStack>
        </label>
      </Box>


      <Text color={isConnected ? 'green' : 'red'}>
        {isConnected ? 'WebSocket Connecté' : 'WebSocket Déconnecté'}
      </Text>


     






      {/* Modal pour choisir le nom du fichier */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Name</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={confirmSaveFile} isLoading={isSaving}>
              Save
            </Button>
            <Button onClick={onClose} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </Box>
  );
};

export default CodeEditor;