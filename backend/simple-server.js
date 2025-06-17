const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Test route
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running!', port: PORT });
});

// Test image route
app.get('/api/test-image', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Images should be available at /images/filename',
        example: `http://localhost:${PORT}/images/comtam.webp`
    });
});

// List available images
app.get('/api/images', (req, res) => {
    const fs = require('fs');
    try {
        const imagesDir = path.join(__dirname, 'images');
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => 
            file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|avif)$/)
        );
        
        res.json({
            success: true,
            total: imageFiles.length,
            images: imageFiles.map(file => ({
                filename: file,
                url: `http://localhost:${PORT}/images/${file}`
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple server running on http://localhost:${PORT}`);
    console.log(`📁 Images available at http://localhost:${PORT}/images/`);
    console.log(`🔍 Test health: http://localhost:${PORT}/api/health`);
    console.log(`📋 List images: http://localhost:${PORT}/api/images`);
});

module.exports = app;
