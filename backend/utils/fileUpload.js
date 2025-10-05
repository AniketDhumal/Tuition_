const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadFile = async (file, folder) => {
    try {
        const folderPath = path.join(uploadDir, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        const fileExt = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(folder, fileName);
        const fullPath = path.join(uploadDir, filePath);
        
        await file.mv(fullPath);
        
        return {
            fileUrl: filePath,
            fileSize: file.size,
            fileType: file.mimetype
        };
    } catch (err) {
        console.error('Error uploading file:', err);
        throw err;
    }
};

const deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(uploadDir, filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        console.error('Error deleting file:', err);
        throw err;
    }
};

module.exports = { uploadFile, deleteFile };