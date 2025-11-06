const httpMocks = require('node-mocks-http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const userController = require('../../controllers/userController');

// Mock des dépendances
jest.mock('../../models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Constantes pour les messages
const MESSAGES = {
  USER_EXISTS: 'User already exists!',
  INVALID_PASSWORD: 'Password invalid!',
  INVALID_CREDENTIALS: 'Mail or password invalid!',
  SOMETHING_WRONG: 'Something went wrong',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('User Controller Tests', () => {
  describe('signup', () => {
    it('should create a new user and return 200 status', async () => {
      const req = httpMocks.createRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'John',
          lastname: 'Doe',
          role: 'user',
        },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue(null); // Aucun utilisateur existant
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const savedUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'John',
        lastname: 'Doe',
        role: 'user',
      };

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedUser),
      }));

      await userController.signup(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(savedUser);
    });

    it('should return 500 if password hashing fails', async () => {
        const req = httpMocks.createRequest({
          body: { email: 'test@example.com', password: 'password123' },
        });
        const res = httpMocks.createResponse();
      
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockRejectedValue(new Error('Hash error'));
      
        await userController.signup(req, res);
      
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe(MESSAGES.SOMETHING_WRONG);
      });
      

    it('should return 400 if user already exists', async () => {
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com' },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      await userController.signup(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData()).toBe(MESSAGES.USER_EXISTS);
    });

    it('should return 500 on unexpected error', async () => {
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockRejectedValue(new Error('Database error'));

      await userController.signup(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getData()).toBe(MESSAGES.SOMETHING_WRONG);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const res = httpMocks.createResponse();

      const existingUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      User.findOne.mockResolvedValue(existingUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      await userController.login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ token: 'mockToken', userId: '123' });
    });


    it('should return 500 if JWT signing fails', async () => {
        const req = httpMocks.createRequest({
          body: { email: 'test@example.com', password: 'password123' },
        });
        const res = httpMocks.createResponse();
      
        const existingUser = { email: 'test@example.com', password: 'hashedPassword' };
        User.findOne.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockImplementation(() => {
          throw new Error('JWT error');
        });
      
        await userController.login(req, res);
      
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe(MESSAGES.SOMETHING_WRONG);
      });
      

      
    it('should return 400 if password is incorrect', async () => {
        const req = httpMocks.createRequest({
          body: { email: 'test@example.com', password: 'wrongPassword' },
        });
        const res = httpMocks.createResponse();
      
        const existingUser = { email: 'test@example.com', password: 'hashedPassword' };
        User.findOne.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(false);
      
        await userController.login(req, res);
      
        expect(res.statusCode).toBe(400);
        expect(res._getData()).toBe(MESSAGES.INVALID_PASSWORD);
      });
      

    it('should return 400 if email or password is invalid', async () => {
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com', password: 'wrongPassword' },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockResolvedValue(null);

      await userController.login(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData()).toBe(MESSAGES.INVALID_CREDENTIALS);
    });

    it('should return 500 on unexpected error', async () => {
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com', password: 'password123' },
      });
      const res = httpMocks.createResponse();

      User.findOne.mockRejectedValue(new Error('Database error'));

      await userController.login(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getData()).toBe(MESSAGES.SOMETHING_WRONG);
    });
  });
});
