# 🚀 How to Start the Package

## 📁 1. Project Placement

Place this package **next to** the `gl-website-rails` directory so that the relative path to the `public` folder is correct.

Example structure:

```
your-project/
├── gl-website-rails/
└── your-package/
```

---

## 🛠️ 2. Update the Public Path (If Needed)

If the package is not placed next to `gl-website-rails`, update the following line in your server file to match the correct relative path to the `public` folder:

```js
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, '../gl-website-rails/public');
```

---

## 📥 3. Clone & Install Dependencies

```bash
git clone <repository-url>
cd your-package
npm install
```

---

## ▶️ 4. Start the Server

To start the server with Node.js:

```bash
node server.js
```

To start the server with Nodemon (if installed globally):

```bash
nodemon server.js
```

> 💡 If `nodemon` is not installed globally, you can install it with:

```bash
npm install -g nodemon
```
