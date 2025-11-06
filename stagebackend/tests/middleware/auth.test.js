const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('auth middleware', () => {
  it('should return 401 if no token is provided', () => {
    const req = { header: jest.fn().mockReturnValue(null) };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status().json).toHaveBeenCalledWith({ message: 'No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if token is invalid', () => {
    const req = { header: jest.fn().mockReturnValue('Bearer invalidtoken') };
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().send).toHaveBeenCalledWith({ message: 'Token is not validError: Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', () => {
    const user = { id: '123', role: 'user' };
    const token = jwt.sign(user, '123456789');
    const req = { header: jest.fn().mockReturnValue(`Bearer ${token}`) };
    const res = {};
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockReturnValue(user);

    auth(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});