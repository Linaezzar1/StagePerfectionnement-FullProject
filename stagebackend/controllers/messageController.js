const Message = require('../models/message');

exports.createMessage = async (req, res) => {
  try {
      const { content, targetUserId } = req.body;
      const sender = req.user._id; 

      if (!content || !targetUserId) {
          return res.status(400).json({ message: "Le contenu et le destinataire sont requis." });
      }

      const newMessage = new Message({
          sender,
          targetUserId,
          content,
          timestamp: new Date(),
      });

      await newMessage.save();

      res.status(201).json(newMessage);
  } catch (error) {
      console.error("Erreur lors de l'enregistrement du message :", error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('userId', 'username')
            .populate('targetUserId', 'username')
            .sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessageByUserId = async (req, res) => { 
  try {
    const userId = req.params.id || req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { targetUserId: userId }]
    })
      .populate('sender', 'name role')
      .populate('targetUserId', 'name role')
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getUsersForAdmin = async (req, res) => {
  try {
      const users = await Message.aggregate([
          {
              $group: {
                  _id: "$sender",
                  lastMessage: { $last: "$timestamp" },
              }
          },
          { $sort: { lastMessage: -1 } },
          {
              $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "userDetails"
              }
          },
          {
              $unwind: "$userDetails"
          },
          {
              $match: { "userDetails.role": { $ne: "admin" } } // Exclure les admins
          },
          {
              $project: {
                  _id: "$userDetails._id",
                  fullname: "$userDetails.fullname",
                  email: "$userDetails.email",
                  lastMessage: 1
              }
          }
      ]);

      res.status(200).json(users);
  } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
};

  
