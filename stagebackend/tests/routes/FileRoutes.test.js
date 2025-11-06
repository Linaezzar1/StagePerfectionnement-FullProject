const request = require('supertest');
const app = require('../../server'); // Assurez-vous que 'app' est l'instance de votre serveur Express
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const File = require('../../models/file');
const User = require('../../models/user');

let authToken; // Token d'authentification pour les tests nécessitant une authentification

jest.setTimeout(300000);

beforeAll(async () => {
    console.log("Starting MongoMemoryServer...");
    await mongod.start();
    const uri = await mongod.getUri();
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connection established.");

    // Créer un utilisateur pour tester l'authentification
    const user = new User({
        name: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'user',
    });

    const savedUser = await user.save();

    // Authentification - obtenir un token d'accès
    const response = await request(app)
        .post('/login') // Assurez-vous que votre route de login existe
        .send({
            email: 'john.doe@example.com',
            password: 'password123',
        });

    authToken = response.body.token; // Récupérer le token d'authentification
});

afterAll(async () => {
    console.log("Dropping database...");
    await mongoose.connection.dropDatabase();
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("Stopping MongoMemoryServer...");
    await mongod.stop();
},300000);

afterEach(async () => {
    await File.deleteMany({});
    await User.deleteMany({});
  });


describe('File Routes', () => {
    it('should create a new file', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const response = await request(app)
            .post('/files/addFile')
            .set('Authorization', `Bearer ${authToken}`)
            .send(fileData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe(fileData.name);
        expect(response.body.content).toBe(fileData.content);
    });

    it('should fail to create a file without authentication', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const response = await request(app)
            .post('/files/addFile')
            .send(fileData);

        expect(response.status).toBe(401); // Non autorisé
        expect(response.body.message).toBe('Authentication required');
    });

    it('should return 400 for missing fields in file creation', async () => {
        const invalidFileData = { language: 'javascript' }; // Missing fields
    
        const response = await request(app)
            .post('/files/addFile')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidFileData);
    
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Validation error');
    });
    

    it('should get files by userId', async () => {
        const userId = mongoose.Types.ObjectId();
        const fileData1 = {
            userId,
            name: 'testFile1',
            content: 'testContent1',
            language: 'javascript',
        };
        const fileData2 = {
            userId,
            name: 'testFile2',
            content: 'testContent2',
            language: 'python',
        };

        await File.create([fileData1, fileData2]);

        const response = await request(app)
            .get('/files/getFiles')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].userId).toEqual(userId.toString());
        expect(response.body[1].userId).toEqual(userId.toString());
    });

    it('should get file by ID', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = await File.create(fileData);

        const response = await request(app)
            .get(`/files/getFileById/${file._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toEqual(file._id.toString());
        expect(response.body.name).toBe(fileData.name);
    });

    it('should update a file', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = await File.create(fileData);

        const updatedData = { content: 'updatedContent' };

        const response = await request(app)
            .put(`/files/updateFile/${file._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.content).toBe(updatedData.content);
    });

    it('should delete a file', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = await File.create(fileData);

        const response = await request(app)
            .delete(`/files/deleteFile/${file._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File deleted successfully');
    });

    it('should fail to delete a file without authentication', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = await File.create(fileData);

        const response = await request(app)
            .delete(`/files/deleteFile/${file._id}`);

        expect(response.status).toBe(401); // Non autorisé
        expect(response.body.message).toBe('Authentication required');
    });

    it('should get files count by user', async () => {
        const response = await request(app)
            .get('/files/countByUser')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('count');
    });

    it('should get files count by month', async () => {
        const response = await request(app)
            .get('/files/countByMonth')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('month');
    });

    it('should get modified stats', async () => {
        const response = await request(app)
            .get('/files/modifiedStats')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('modifiedCount');
    });

    it('should get created files this week', async () => {
        const response = await request(app)
            .get('/files/getCreatedFiles')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get modified files this week', async () => {
        const response = await request(app)
            .get('/files/getModifiedFiles')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
