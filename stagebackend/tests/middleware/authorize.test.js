const authorize = require('../middleware/authorize');

describe('authorize middleware', () => {
  it('should return 403 if user role is not authorized', () => {
    const req = { user: { role: 'user' } };
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    const next = jest.fn();

    const middleware = authorize(['admin']); // Seuls les admins sont autorisés
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.status().send).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user role is authorized', () => {
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();

    const middleware = authorize(['admin']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
