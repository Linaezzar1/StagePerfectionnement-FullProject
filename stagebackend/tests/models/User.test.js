const mongoose = require('mongoose');
const User = require('../../models/user'); // Assurez-vous d'importer le bon modèle
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();

jest.setTimeout(300000);

beforeAll(async () => {
    console.log("Starting MongoMemoryServer...");
    await mongod.start();
    const uri = await mongod.getUri();
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connection established.");
}, 300000);

afterAll(async () => {
    console.log("Dropping database...");
    await mongoose.connection.dropDatabase();
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("Stopping MongoMemoryServer...");
    await mongod.stop();
},300000);

afterEach(async () => {
    await User.deleteMany({}); // Supprimer tous les utilisateurs après chaque test
});

describe('User Model', () => {
    it('should create and save a user successfully', async () => {
        const userData = {
            name: 'John',
            lastname: 'Doe',
            email: 'johndoe@example.com',
            password: 'password123',
            role: 'user',
            ActiveStatus: 'active',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.lastname).toBe(userData.lastname);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.password).toBe(userData.password); // Il serait préférable de hacher le mot de passe dans un test réel
        expect(savedUser.role).toBe(userData.role);
        expect(savedUser.ActiveStatus).toBe(userData.ActiveStatus);
    });

    it('should fail if required fields are missing', async () => {
        const userData = {
            name: 'John',
            lastname: 'Doe',
            // L'email et le mot de passe sont manquants
            role: 'user',
            ActiveStatus: 'active',
        };

        const user = new User(userData);

        let error;
        try {
            await user.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.email).toBeDefined(); // email est requis
        expect(error.errors.password).toBeDefined(); // password est requis
    });

    it('should fail if email is not unique', async () => {
        const userData1 = {
            name: 'John',
            lastname: 'Doe',
            email: 'johndoe@example.com',
            password: 'password123',
            role: 'user',
            ActiveStatus: 'active',
        };

        const userData2 = {
            name: 'Jane',
            lastname: 'Doe',
            email: 'johndoe@example.com', // email identique
            password: 'password456',
            role: 'user',
            ActiveStatus: 'inactive',
        };

        const user1 = new User(userData1);
        await user1.save();

        const user2 = new User(userData2);
        let error;
        try {
            await user2.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.email).toBeDefined(); // email unique requis
    });

    it('should set default role to "user" if role is not provided', async () => {
        const userData = {
            name: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser.role).toBe('user'); // Le rôle doit être par défaut 'user'
    });

    it('should set default ActiveStatus to "inactive" if not provided', async () => {
        const userData = {
            name: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            role: 'user',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser.ActiveStatus).toBe('inactive'); // Le statut actif doit être 'inactive' par défaut
    });

    it('should create a user with the default ActiveStatus', async () => {
        const userData = {
            name: 'Alice',
            lastname: 'Smith',
            email: 'alice.smith@example.com',
            password: 'password123',
            role: 'admin',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser.ActiveStatus).toBe('inactive'); // ActiveStatus devrait être 'inactive' par défaut
    });

    it('should hash the password before saving', async () => {
        const userData = {
            name: 'John',
            lastname: 'Doe',
            email: 'johndoe@example.com',
            password: 'password123',
            role: 'user',
            ActiveStatus: 'active',
        };
    
        const user = new User(userData);
        const savedUser = await user.save();
    
        expect(savedUser.password).not.toBe(userData.password); // Ensure password is hashed
        expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true); // Verify hash
    });

    
});
