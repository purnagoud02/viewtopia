const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const posterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/posters";
    ensureDir(dir);
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/videos";
    ensureDir(dir);
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/avatars";
    ensureDir(dir);
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadPoster = multer({ storage: posterStorage });
const uploadVideo = multer({ storage: videoStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = {
  uploadPoster,
  uploadVideo,
  uploadAvatar,
};