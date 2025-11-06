const File = require('../../models/file');
const fileController = require('../../controllers/fileController');
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const moment = require('moment');

// Mock du modèle File
jest.mock('../../models/file');

describe('File Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialiser les mocks avant chaque test
  });

  // Test pour la fonction getFiles
  describe('getFiles', () => {
    it('should return all files', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.find pour simuler la récupération de tous les fichiers
      const files = [
        { _id: '123', name: 'file1', content: 'content1' },
        { _id: '456', name: 'file2', content: 'content2' },
      ];
      File.find.mockResolvedValue(files);

      await fileController.getFiles(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(files);
    });

    it('should return an empty array if no files exist', async () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
      
        File.find.mockResolvedValue([]);
      
        await fileController.getFiles(req, res);
      
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual([]);
      });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.find pour simuler une erreur
      File.find.mockRejectedValue(new Error('Database error'));

      await fileController.getFiles(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la récupération des fichiers', error: 'Database error' });
    });
  });

  // Test pour la fonction getFileById
  describe('getFileById', () => {
    it('should return a file by ID', async () => {
      const req = httpMocks.createRequest({
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.findById pour simuler la récupération d'un fichier
      const file = { _id: '123', name: 'file1', content: 'content1' };
      File.findById.mockResolvedValue(file);

      await fileController.getFileById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(file);
    });

    it('should return 404 status if file is not found', async () => {
      const req = httpMocks.createRequest({
        params: { id: 'invalidId' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.findById pour simuler qu'aucun fichier n'est trouvé
      File.findById.mockResolvedValue(null);

      await fileController.getFileById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Fichier non trouvé' });
    });
  });

  // Test pour la fonction createFile
  describe('createFile', () => {
    it('should create a new file and return 201 status', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
        body: {
          name: 'file1',
          content: 'content1',
          language: 'javascript',
        },
      });
      const res = httpMocks.createResponse();

      // Mock de File.save pour simuler la sauvegarde d'un fichier
      const newFile = {
        _id: '123',
        userId: '123',
        name: 'file1',
        content: 'content1',
        language: 'javascript',
      };
      File.prototype.save.mockResolvedValue(newFile);

      await fileController.createFile(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(newFile);
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
        body: {
          name: 'file1',
          content: 'content1',
          language: 'javascript',
        },
      });
      const res = httpMocks.createResponse();

      // Mock de File.save pour simuler une erreur
      File.prototype.save.mockRejectedValue(new Error('Database error'));

      await fileController.createFile(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la création du fichier', error: {} });
    });
  });

  // Test pour la fonction updateFile
  describe('updateFile', () => {
    it('should update a file and return 200 status', async () => {
      const req = httpMocks.createRequest({
        params: { id: '123' },
        body: {
          content: 'updatedContent',
        },
      });
      const res = httpMocks.createResponse();

      // Mock de File.findByIdAndUpdate pour simuler la mise à jour d'un fichier
      const updatedFile = {
        _id: '123',
        name: 'file1',
        content: 'updatedContent',
      };
      File.findByIdAndUpdate.mockResolvedValue(updatedFile);

      await fileController.updateFile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(updatedFile);
    });

    it('should return 404 status if an error occurs', async () => {
      const req = httpMocks.createRequest({
        params: { id: '123' },
        body: {
          content: 'updatedContent',
        },
      });
      const res = httpMocks.createResponse();

      File.findByIdAndUpdate.mockResolvedValue(null);

      await fileController.updateFile(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Fichier non trouvé' });
    });
  });

  // Test pour la fonction deleteFile
  describe('deleteFile', () => {
    it('should delete a file and return 200 status', async () => {
      const req = httpMocks.createRequest({
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.findByIdAndDelete pour simuler la suppression d'un fichier
      File.findByIdAndDelete.mockResolvedValue(true);

      await fileController.deleteFile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Fichier supprimé avec succès' });
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest({
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.findByIdAndDelete pour simuler une erreur
      File.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      await fileController.deleteFile(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la suppression du fichier', error: {} });
    });
  });

  // Test pour la fonction getFilesCountByUser
  describe('getFilesCountByUser', () => {
    it('should return the count of files by user', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler la récupération du nombre de fichiers par utilisateur
      const files = [
        { _id: '123', totalFiles: 2, userInfo: [{ name: 'John Doe' }] },
        { _id: '456', totalFiles: 1, userInfo: [{ name: 'Jane Doe' }] },
      ];
      File.aggregate.mockResolvedValue(files);

      await fileController.getFilesCountByUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(files);
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler une erreur
      File.aggregate.mockRejectedValue(new Error('Database error'));

      await fileController.getFilesCountByUser(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors du comptage des fichiers', error: {} });
    });
  });

  // Test pour la fonction countByMonth
  describe('countByMonth', () => {
    it('should return the count of files created by month', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler la récupération du nombre de fichiers par mois
      const stats = [
        { _id: 1, totalFiles: 5 },
        { _id: 2, totalFiles: 3 },
      ];
      File.aggregate.mockResolvedValue(stats);

      await fileController.countByMonth(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(stats);
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler une erreur
      File.aggregate.mockRejectedValue(new Error('Database error'));

      await fileController.countByMonth(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la récupération des statistiques de fichiers créés', error: {} });
    });
  });

  // Test pour la fonction modifiedstats
  describe('modifiedstats', () => {
    it('should return the count of modified files by month', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler la récupération du nombre de fichiers modifiés par mois
      const stats = [
        { _id: 1, totalFiles: 2 },
        { _id: 2, totalFiles: 1 },
      ];
      File.aggregate.mockResolvedValue(stats);

      await fileController.modifiedstats(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(stats);
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler une erreur
      File.aggregate.mockRejectedValue(new Error('Database error'));

      await fileController.modifiedstats(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la récupération des statistiques de fichiers modifiés', error: {} });
    });
  });

  // Test pour la fonction getCreatedFilesThisWeek
  describe('getCreatedFilesThisWeek', () => {
    it('should return the count of files created this week', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler la récupération du nombre de fichiers créés cette semaine
      const stats = [{ totalFiles: 3 }];
      File.aggregate.mockResolvedValue(stats);

      await fileController.getCreatedFilesThisWeek(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(stats[0] || { totalFiles: 0 });
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler une erreur
      File.aggregate.mockRejectedValue(new Error('Database error'));

      await fileController.getCreatedFilesThisWeek(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la récupération des fichiers créés cette semaine', error: {} });
    });
  });

  // Test pour la fonction getModifiedFilesThisWeek
  describe('getModifiedFilesThisWeek', () => {
    it('should return the count of files modified this week', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler la récupération du nombre de fichiers modifiés cette semaine
      const stats = [{ totalFiles: 2 }];
      File.aggregate.mockResolvedValue(stats);

      await fileController.getModifiedFilesThisWeek(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(stats[0] || { totalFiles: 0 });
    });

    it('should return 500 status if an error occurs', async () => {
      const req = httpMocks.createRequest({
        user: { _id: '123' },
      });
      const res = httpMocks.createResponse();

      // Mock de File.aggregate pour simuler une erreur
      File.aggregate.mockRejectedValue(new Error('Database error'));

      await fileController.getModifiedFilesThisWeek(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Erreur lors de la récupération des fichiers modifiés cette semaine', error: {} });
    });
  });
});