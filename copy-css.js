const fs = require('fs');
const path = require('path');
const glob = require('glob');

function createDirIfNotExist(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyCSSFiles() {
  // Glob pattern to match all .css files in src directories
  const srcPattern = 'packages/*/src/**/*.css';

  glob(srcPattern, (err, files) => {
    if (err) {
      console.error('Error reading CSS files:', err);
      return;
    }

    files.forEach((file) => {
      const distDir = file.replace('src', 'dist');
      createDirIfNotExist(path.dirname(distDir));

      fs.copyFileSync(file, distDir);
      console.log(`Copied ${file} to ${distDir}`);
    });
  });
}

copyCSSFiles();
