# 🚀 How to Start the Package

1. 📂 **Place the package next to** the `gl-website-rails` directory.

2. 🔧 **Or update the path manually** by modifying the following line in your code to match the correct relative path to the `public` folder:

```js
   const path = require('path');
   const PUBLIC_DIR = path.join(__dirname, '../gl-website-rails/public');
```