const File = require('../models/file');
const User = require('../models/user');
const moment = require('moment');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); // Import ObjectId from the MongoDB driver
const path = require('path');
const fs = require('fs');



exports.getFiles = async (req, res) => {
  try {
      const files = await File.find().populate('userId', 'name'); // 'username' est le champ de l'utilisateur que vous voulez afficher
      res.status(200).json(files);
  } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des fichiers", error });
  }
};

// Récupérer tous les fichiers d'un utilisateur spécifique
exports.getAllFilesByUserId = async (req, res) => {
  try {
    const userId = req.user._id;

      // Vérification de l'ID utilisateur
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "ID utilisateur invalide" });
      }

      const userFiles = await File.find({ userId: userId }).populate('userId', 'name'); // Populate pour afficher le nom

      res.status(200).json(userFiles);
  } catch (error) {
      console.error('Erreur lors de la récupération des fichiers de l\'utilisateur :', error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);

        if (!file) {
            return res.status(404).json({ message: "Fichier non trouvé" });
        }

        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du fichier", error });
    }
};


exports.createFile = async (req, res) => {
    try {
        const { name, content, language  } = req.body;
        const userId = req.user._id;  


        
        const newFile = new File({
            userId,
            name,
            content: content || '', 
            language: language
        });

       
        await newFile.save();

        
        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du fichier", error });
    }
};


exports.updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedFile = await File.findByIdAndUpdate(
            id,
            {content},
            { new: true }
        );
        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du fichier", error });
    }
};


exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        await File.findByIdAndDelete(id);
        res.status(200).json({ message: "Fichier supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du fichier", error });
    }
};

exports.getFilesCountByUser = async (req, res) => {
    try {
      const files = await File.aggregate([
        {
          $group: {
            _id: "$userId", 
            totalFiles: { $sum: 1 },
          }
        },
        {
          $lookup: {
            from: 'users', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'userInfo'
          }
        },
        {
          $unwind: "$userInfo" 
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            username: "$userInfo.name",
            totalFiles: 1,
          },
        },
      ]);

      console.log(files);
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du comptage des fichiers', error });
    }
};

exports.countByMonth = async(req,res) => {
    try {
        const stats = await File.aggregate([
          {
            $project: {
              month: { $month: '$createdAt' },
            },
          },
          {
            $group: {
              _id: '$month',
              totalFiles: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
    
        res.status(200).json(stats);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de fichiers créés', error });
      }
}

exports.modifiedstats = async (req, res) => {
  try {
    const stats = await File.aggregate([
      {
        $match: {
          $expr: { $ne: ['$createdAt', '$updatedAt'] } 
        }
      },
      {
        $project: {
          month: { $month: '$updatedAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          totalFiles: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de fichiers modifiés', error });
  }
};



exports.getCreatedFilesThisWeek = async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the authenticated request
        console.log('User ID:', userId);

        // Validate the user ID
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID utilisateur invalide' });
        }

        // Calculate the start and end of the current week
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        console.log('Start of Week:', startOfWeek);
        console.log('End of Week:', endOfWeek);

        // Aggregate to count the files created by the user this week
        const stats = await File.aggregate([
            {
                $match: {
                    userId: new ObjectId(userId), // Use new ObjectId() here
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek }, // Match files created within the current week
                },
            },
            {
                $count: 'totalFiles', // Count the number of files
            },
        ]);

        console.log('Aggregation Result:', stats);

        // Return the count of files created this week
        res.status(200).json(stats[0] || { totalFiles: 0 });
    } catch (error) {
        console.error('Error in getCreatedFilesThisWeek:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers créés cette semaine', error: error.message });
    }
};
exports.getModifiedFilesThisWeek = async (req, res) => {
  try {
      const userId = req.user._id; // Get the user ID from the authenticated request

      console.log('User ID:', userId);

      // Validate the user ID
      if (!ObjectId.isValid(userId)) {
          return res.status(400).json({ message: 'ID utilisateur invalide' });
      }

      // Calculate the start and end of the current week
      const startOfWeek = moment().startOf('week').toDate();
      const endOfWeek = moment().endOf('week').toDate();

      console.log('Start of Week:', startOfWeek);
      console.log('End of Week:', endOfWeek);

      // Aggregate to count the files modified by the user this week
      const stats = await File.aggregate([
          {
              $match: {
                  userId: new ObjectId(userId), // Use new ObjectId() here
                  updatedAt: { $gte: startOfWeek, $lte: endOfWeek }, // Match files modified within the current week
                  $expr: { $ne: ['$createdAt', '$updatedAt'] }, // Ensure createdAt and updatedAt are different
              },
          },
          {
              $count: 'totalFiles', // Count the number of files
          },
      ]);

      console.log('Aggregation Result:', stats);

      // Return the count of files modified this week
      res.status(200).json(stats[0] || { totalFiles: 0 });
  } catch (error) {
      console.error('Error in getModifiedFilesThisWeek:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des fichiers modifiés cette semaine', error: error.message });
  }
};


// Fonction pour récupérer les fichiers créés par jour sur une semaine
exports.getFilesCreatedPerDay = async (req, res) => {
  try {
      const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');
      
      const files = await File.aggregate([
          {
              $match: { createdAt: { $gte: sevenDaysAgo.toDate() } }
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 }
              }
          },
          { $sort: { _id: 1 } }
      ]);

      res.json(files);
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.getFilesModifiedPerDay = async (req, res) => {
  try {
      const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');
      
      const files = await File.aggregate([
          {
              $match: {
                  updatedAt: { $gte: sevenDaysAgo.toDate() },
                  $expr: { $ne: ['$createdAt', '$updatedAt'] } // Vérifier que le fichier a été modifié
              }
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                  count: { $sum: 1 }
              }
          },
          { $sort: { _id: 1 } }
      ]);

      res.status(200).json(files);
  } catch (error) {
      console.error("Erreur lors de la récupération des fichiers modifiés par jour:", error);
      res.status(500).json({ message: "Erreur serveur", error });
  }
};











