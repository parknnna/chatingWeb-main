// multer모듈 적용 (for 파일업로드)

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4())
    }
})

module.exports = multer({ storage: storage })
        