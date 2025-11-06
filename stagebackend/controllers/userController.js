const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const File = require('../models/file');

exports.signup = async (req, res) => {
    let data = req.body;

    try {
        let existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).send('Email déjà utilisé.');
        }

        let user = new User(data);

        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(data.password, salt);

        let savedUser = await user.save();
        res.status(200).send(savedUser);

    } catch (error) {
        console.log('Erreur lors de la creation du compte :', error);
        res.status(500).send('Erreur lors de la création du compte.');

    }
};

exports.login = async (req, res) => {
    let data = req.body;
    try {
        let user = await User.findOne({ email: data.email });

        if (!user) {
            return res.status(400).send('Mail invalid');
        }

        const valid = await bcrypt.compare(data.password, user.password);
        if (!valid) {
            return res.status(400).send('Password invalid!');
        }

        // Mettre à jour la dernière activité avant de répondre
        user.lastActive = new Date();
        await user.save();

        let payload = {
            _id: user._id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            role: user.role
        };

        let token = jwt.sign(payload, '123456789');

        res.status(200).send({ mytoken: token, user });

    } catch (err) {
        res.status(500).send('Error occurred: ' + err.message);
    }
};


exports.getAllUsers = (req, res) => {
    User.find({})
        .then((users) => {
            res.status(200).send(users);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

exports.getUserById = (req, res) => {
    const id = req.params.id;

    User.findOne({ _id: id })

    User.findOne({ _id: id })
        .then((user) => {
            if (!user) return res.status(404).send({ message: 'User not found' });
            res.status(200).send(user);
        })
        .catch((err) => {
            res.status(500).send({ error: 'An error occurred while fetching the user' })
        });
}

exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    const { userId } = req.body; // Tu peux récupérer l'ID de l'utilisateur à supprimer dans le corps de la requête

    try {
        const user = await User.findByIdAndDelete(userId); // Supprimer l'utilisateur par ID

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Suppression des fichiers associés à l'utilisateur
        await File.deleteMany({ userId });

        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
};



// Fonction pour mettre à jour l'activité utilisateur
exports.updateLastActive = async (req, res) => {
    try {
        const { userId } = req.body;  // Récupérer l'ID envoyé par le frontend

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { lastActive: new Date() },
            { new: true, timestamps: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User activity updated successfully", 
            lastActive: updatedUser.lastActive 
        });

    } catch (error) {
        console.error("Error updating user activity:", error);
        res.status(500).json({ message: "Failed to update user activity" });
    }
};




