const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const User = require('../models/user');

let authToken;

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
},300000);

afterAll(async () => {
    console.log("Dropping database...");
    await mongoose.connection.dropDatabase();
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("Stopping MongoMemoryServer...");
    await mongod.stop();
},300000);

describe('User Routes', () => {
    it('should signup a new user successfully', async () => {
        const userData = {
            name: 'Jane',
            lastname: 'Doe',
            email: 'jane.doe@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/users/signup')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(userData.email);
    });

    it('should fail signup if email already exists', async () => {
        const userData = {
            name: 'Jane',
            lastname: 'Doe',
            email: 'john.doe@example.com', // Email déjà existant
            password: 'password123',
        };

        const response = await request(app)
            .post('/users/signup')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already exists');
    });

    it('should login successfully', async () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/users/login')
            .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(loginData.email);
    });

    it('should fail login with wrong credentials', async () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'wrongpassword', // Mauvais mot de passe
        };

        const response = await request(app)
            .post('/users/login')
            .send(loginData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reset password successfully with valid token', async () => {
        const resetData = {
            oldPassword: 'password123',
            newPassword: 'newpassword123',
        };

        const response = await request(app)
            .post('/users/resetPassword')
            .set('Authorization', `Bearer ${authToken}`)
            .send(resetData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password reset successfully');
    });

    it('should fail to reset password without authentication', async () => {
        const resetData = {
            oldPassword: 'password123',
            newPassword: 'newpassword123',
        };

        const response = await request(app)
            .post('/users/resetPassword')
            .send(resetData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication required');
    });

    it('should get all users', async () => {
        const response = await request(app)
            .get('/users/all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get user by ID', async () => {
        const user = await User.findOne({ email: 'john.doe@example.com' });

        const response = await request(app)
            .get(`/users/userbyid/${user._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toEqual(user._id.toString());
        expect(response.body.email).toBe(user.email);
    });

    it('should get current user', async () => {
        const response = await request(app)
            .get('/users/currentUser')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('john.doe@example.com');
    });

    it('should update active status successfully', async () => {
        const response = await request(app)
            .patch('/users/activeStatus')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ activeStatus: 'active' });

        expect(response.status).toBe(200);
        expect(response.body.activeStatus).toBe('active');
    });
});
