const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, '../gl-website-rails/public');

// Serve static files
app.use('/public', express.static(PUBLIC_DIR));

// Helper: get file size in readable format
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Recursively find matching files
function findFilesWithNameContaining(dir, keyword, fileList = [], basePath = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.join(basePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findFilesWithNameContaining(fullPath, keyword, fileList, relativePath);
        } else if (file.toLowerCase().includes(keyword.toLowerCase())) {
            fileList.push({
                url: `/public/${relativePath.replace(/\\/g, '/')}`,
                name: file,
                size: formatBytes(stat.size),
                ext: path.extname(file).toLowerCase(),
            });
        }
    }

    return fileList;
}

// Main route
app.get('/', (req, res) => {
    const keyword = req.query.keyword || 'abhishek';
    const matchedFiles = findFilesWithNameContaining(PUBLIC_DIR, keyword);

    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

    const images = matchedFiles.filter(file => imageExts.includes(file.ext));
    const others = matchedFiles.filter(file => !imageExts.includes(file.ext));

    const renderCards = (files, isImage = false) => {
        return files.map(file => `
            <li class="card">
                <img src="${file.url}" alt="${file.name}">
                <p><strong>Name:</strong> ${file.name}</p>
                <p><strong>Type:</strong> ${file.ext}</p>
                <p><strong>Size:</strong> ${file.size}</p>
                <p style="margin-bottom:20px;"><strong>filePath:</strong> ${file.url}</a><br>
                <a href="${file.url}" target="_blank">Open File</a>
            </li>
        `).join('\n');
    };

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Grouped File Browser</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background: #f9f9f9;
                    text-align: center;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 20px;
                }
                form {
                    margin-bottom: 30px;
                }
                input[type="text"] {
                    padding: 10px;
                    font-size: 16px;
                    width: 300px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px 16px;
                    font-size: 16px;
                    border: none;
                    background-color: #005678;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }
                section {
                    margin-top: 40px;
                }
                h2 {
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 10px;
                }
                ul {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: center;
                    padding: 0;
                    list-style: none;
                }
                .card {
                    background: white;
                    padding: 15px;
                    width: 250px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    text-align: left;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                    word-wrap: break-word;
                }
                .card img {
                    width: 100%;
                    height: 150px;
                    object-fit: contain;
                    margin-bottom: 10px;
                    border: 1px solid #eee;
                }
                .file-icon {
                    font-size: 80px;
                    text-align: center;
                    margin-bottom: 10px;
                }
                a {
                    color: #005678;
                    text-decoration: none;
                    font-weight: bold;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Find Files with Keyword</h1>
            <form method="GET" action="/">
                <input type="text" name="keyword" value="${keyword}" placeholder="Enter keyword..." />
                <button type="submit">Search</button>
            </form>

            <section>
                <h2>🖼 Image Files</h2>
                <ul>
                    ${images.length ? renderCards(images, true) : '<p>No image files found.</p>'}
                </ul>
            </section>

            <section>
                <h2>📄 Other Files</h2>
                <ul>
                    ${others.length ? renderCards(others, false) : '<p>No other files found.</p>'}
                </ul>
            </section>
        </body>
        </html>
    `);
});


app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
