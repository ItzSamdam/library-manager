const multer = require("multer");
const ImageUploader = (req, file, cb) => {
    if ( file.mimetype.includes("jpeg") || file.mimetype.includes("png") || file.mimetype.includes("jpg") || file.mimetype.includes("webp") ) {
        cb(null, true);
    } else {
        cb("Please upload only image file.", false);
    }
};
const storageHandler = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.cwd()}/media/`);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
const uploadFile = multer({
        storage: storageHandler,
        fileFilter: ImageUploader
});
module.exports = uploadFile;