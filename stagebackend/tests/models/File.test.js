const mongoose = require('mongoose');
const File = require('../../models/file');
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
    await File.deleteMany({});
});

describe('File Model', () => {
    it('should create and save a file successfully', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(), // Générer un ObjectId pour userId
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = new File(fileData);
        const savedFile = await file.save();

        expect(savedFile._id).toBeDefined();
        expect(savedFile.userId).toEqual(fileData.userId);
        expect(savedFile.name).toBe(fileData.name);
        expect(savedFile.content).toBe(fileData.content);
        expect(savedFile.language).toBe(fileData.language);
    });

    it('should fail if required fields are missing', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
        };

        const file = new File(fileData);

        let error;
        try {
            await file.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.content).toBeDefined();
        expect(error.errors.language).toBeDefined();
    });

    it('should update a file successfully', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = new File(fileData);
        await file.save();

        const updatedContent = 'updatedContent';
        const updatedFile = await File.findByIdAndUpdate(
            file._id,
            { content: updatedContent },
            { new: true }
        );

        expect(updatedFile.content).toBe(updatedContent);
        expect(updatedFile._id).toEqual(file._id);
    });

    it('should delete a file successfully', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = new File(fileData);
        await file.save();

        const deletedFile = await File.findByIdAndDelete(file._id);
        expect(deletedFile).not.toBeNull();

        const findDeletedFile = await File.findById(file._id);
        expect(findDeletedFile).toBeNull();
    });

    it('should find files by userId', async () => {
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

        const files = await File.find({ userId });
        expect(files.length).toBe(2);
        expect(files[0].userId).toEqual(userId);
        expect(files[1].userId).toEqual(userId);
    });

    it('should fail if language is not in the allowed list', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'invalidLanguage',
        };
    
        const file = new File(fileData);
    
        let error;
        try {
            await file.save();
        } catch (err) {
            error = err;
        }
    
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.language.message).toBe('Invalid language specified.');
    });



    it('should find a file by ID', async () => {
        const fileData = {
            userId: mongoose.Types.ObjectId(),
            name: 'testFile',
            content: 'testContent',
            language: 'javascript',
        };

        const file = new File(fileData);
        await file.save();

        const foundFile = await File.findById(file._id);
        expect(foundFile).not.toBeNull();
        expect(foundFile._id).toEqual(file._id);
        expect(foundFile.name).toBe(fileData.name);
    });

    it('should handle updating a file that does not exist', async () => {
        const updatedContent = 'updatedContent';
        let error;
        try {
            await File.findByIdAndUpdate(mongoose.Types.ObjectId(), { content: updatedContent });
        } catch (err) {
            error = err;
        }
        expect(error).toBeNull(); // Pas d'erreur attendue, mais assure-toi que rien ne se passe
    });

    it('should handle deleting a file that does not exist', async () => {
        let error;
        try {
            await File.findByIdAndDelete(mongoose.Types.ObjectId());
        } catch (err) {
            error = err;
        }
        expect(error).toBeNull(); // Pas d'erreur attendue, mais assure-toi que rien ne se passe
    });

});