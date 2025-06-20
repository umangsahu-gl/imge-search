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
    const keyword = req.query.keyword || "GreatLearning";
    const matchedFiles = findFilesWithNameContaining(PUBLIC_DIR, keyword);

    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const notNeededExts = ['.css','.css.map', '.js', '.map', '.html', '.json', '.txt'];

    const images = matchedFiles.filter(file => imageExts.includes(file.ext));
    const others = matchedFiles.filter(file => !imageExts.includes(file.ext)&& !notNeededExts.includes(file.ext));
    const keptExts = [...images, ...others].map(f => f.ext);
    const removedExts = matchedFiles
        .map(f => f.ext)
        .filter(ext => !keptExts.includes(ext));

    // Unique and comma-separated
    const uniqueRemovedExtsStr = [...new Set(removedExts)].join(', ');

    const renderCards = (files, isImage = false) => {
        return files.map(file => `
            <li class="card">
                <div class="img-box">
                <img src="${file.url}" alt="${file.name}">
                </div>
                <p><strong>Name:</strong> ${file.name}</p>
                <p><strong>Type:</strong> ${file.ext}</p>
                <p><strong>Size:</strong> ${file.size}</p>
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
                    padding-bottom: 10px;
                    display: inline;
                }
                ul {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: center;
                    padding: 0;
                    list-style: none;
                    border-top: 2px solid #ddd;
                    padding-top: 20px;
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
                .card .img-box{
                    width: 100%;
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom:1px solid gray;
                }
                .card img {
                    height:100%;
                    width:100%;
                    aspect-ration:auto;
                    object-fit: contain;
                    margin-bottom: 10px;
                    border: 1px solid #eee;
                    background:#f8f8f8;
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
            <small> Total Files Found:<b> ${matchedFiles.length}</b>
            <br>${uniqueRemovedExtsStr  && `<small> also find some file which removed. having extension <b>${uniqueRemovedExtsStr}</b></small>`}
            <section>
                <span><h2>🖼 Image Files </h2><small>Images found: <b>${images.length || 0}</b></small></span>
                
                <ul>
                    ${images.length ? renderCards(images, true) : '<p>No image files found.</p>'}
                </ul>
            </section>

            <section>
                <span><h2>📄 Other Files</h2> <small>Others found:<b> ${others?.length || 0}</b></small></span>
                
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
