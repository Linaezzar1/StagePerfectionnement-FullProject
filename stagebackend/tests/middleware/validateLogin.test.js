const validateLogin = require('../../middleware/validateLogin');
const { validationResult } = require('express-validator');

describe('validateLogin middleware', () => {
  it('should return 400 if email is invalid', () => {
    const req = { body: { email: 'invalidemail', password: '12345678' } };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();

    validateLogin[0](req, res, next); // Exécuter le 1er middleware (validation de l'email)
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      validateLogin[2](req, res, next); // Exécuter le middleware final
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([{ msg: 'Please enter a valid email address' }]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if password is too short', () => {
    const req = { body: { email: 'test@example.com', password: 'short' } };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const next = jest.fn();

    validateLogin[1](req, res, next); // Exécuter le 2ème middleware (validation du mot de passe)
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      validateLogin[2](req, res, next); // Exécuter le middleware final
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([{ msg: 'Password must be at least 8 characters long' }]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if input is valid', () => {
    const req = { body: { email: 'test@example.com', password: '12345678' } };
    const res = {};
    const next = jest.fn();

    validateLogin[0](req, res, next);
    validateLogin[1](req, res, next);
    validateLogin[2](req, res, next); // Middleware final pour vérifier les erreurs

    expect(next).toHaveBeenCalled();
  });
});
