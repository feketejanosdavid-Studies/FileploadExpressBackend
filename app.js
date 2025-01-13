const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const upload_dir = path.join(__dirname, 'uploads');

if (!fs.existsSync(upload_dir)) {
    fs.mkdirSync(upload_dir);
}

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, upload_dir);
    },
    filename: (req, file, cb) => {
        const uniqe = Date.now()+"-"+Math.round(Math.random()*1E9)
        cb(null, uniqe+"_"+file.originalname);
    }
});

const upload = multer({storage: storage});

app.get('/', (req, res) => {
    return res.status(200).json({message: "OK"});
})

app.post('/upload', upload.single('file'), (req, res) => {
    if(!req.file) {
        req.status(400).json({message: "No file to upload"}); 
    }

    res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
        path: req.file.path
    })
})

app.get('/files', (req, res) => {
    fs.readdir(upload_dir, (err, files) => {
        if (err) res.status(500).send("Unable to list files")
            res.status(200).json(files)
    })
})

app.delete("/files/:filename", (req, res)   => {
    const filePath = path.join(upload_dir, req.params.filename);

    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).send("Unable to delete file")
            res.status(200).send("File deleted successfully")
    });
})

app.use('/uploads', express.static(upload_dir));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})