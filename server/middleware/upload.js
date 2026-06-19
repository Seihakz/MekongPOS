const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const productsDir = path.join(__dirname, '..', 'uploads', 'products');
const settingsDir = path.join(__dirname, '..', 'uploads', 'settings');
[productsDir, settingsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route to settings dir for logo uploads
    if (req.route && req.route.path === '/logo') {
      return cb(null, settingsDir);
    }
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
