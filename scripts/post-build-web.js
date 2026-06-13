const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const oldPath = path.join(distDir, 'assets/node_modules');
const newPath = path.join(distDir, 'assets/vendor_modules');

// Helper to recursively get files
function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  return files;
}

function run() {
  console.log('--- Running Web Post-Build Fix ---');

  if (fs.existsSync(oldPath)) {
    // If vendor_modules already exists, clean it up first
    if (fs.existsSync(newPath)) {
      console.log('Cleaning up existing vendor_modules directory...');
      fs.rmSync(newPath, { recursive: true, force: true });
    }
    
    // Rename node_modules to vendor_modules
    console.log('Renaming assets/node_modules to assets/vendor_modules...');
    fs.renameSync(oldPath, newPath);
  } else {
    console.log('assets/node_modules not found. Skipping rename.');
  }

  // Find and replace all occurrences of "assets/node_modules" with "assets/vendor_modules"
  const files = getFiles(distDir);
  console.log(`Processing ${files.length} exported files...`);

  let replacedCount = 0;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    // Only process text files
    if (['.js', '.html', '.css', '.json', '.map'].includes(ext)) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('assets/node_modules')) {
          // Replace all occurrences
          const updated = content.split('assets/node_modules').join('assets/vendor_modules');
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`Updated assets path in: ${path.relative(distDir, file)}`);
          replacedCount++;
        }
      } catch (err) {
        console.error(`Failed to process file ${file}:`, err);
      }
    }
  }

  console.log(`Post-build web fix complete! Replaced references in ${replacedCount} files.`);
}

run();
