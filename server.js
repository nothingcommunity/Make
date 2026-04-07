const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Uploads folder banaye agar nahi hai
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

app.use(express.static('public'));

app.post('/upscale', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('Please upload an image.');

    const scale = parseInt(req.body.scale) || 2;
    const inputPath = req.file.path;
    const outputPath = `uploads/upscaled_${Date.now()}.jpg`;

    try {
        const metadata = await sharp(inputPath).metadata();
        const newWidth = metadata.width * scale;

        await sharp(inputPath)
            .resize(newWidth) 
            .modulate({ brightness: 1, saturation: 1.05 }) 
            .jpeg({ quality: 95 }) 
            .toFile(outputPath);

        res.download(outputPath, `HD_${scale}x_${req.file.originalname}`, () => {
            // Processing ke baad file delete karna taaki server full na ho
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error!');
    }
});

app.listen(port, () => {
    console.log(`Server is running!`);
});
