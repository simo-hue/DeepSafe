#!/bin/bash

# 1. Build the Next.js App (Static Export)
echo "🏗️  Building Next.js App..."
npm run build

# 2. Prepare the Landing Page
echo "🎨 Merging Landing Page..."

# Copy Landing Page files to the 'out' directory (overwriting index.html)
# We use -R to copy directories recursively
cp -R "LANDING PAGE/"* out/

# 3. Create .nojekyll to bypass Jekyll processing on GitHub Pages
# (Necessary for _next folder to work)
touch out/.nojekyll

echo "✅ Build Complete!"
echo "📂 The 'out' folder is ready for GitHub Pages."
echo ""
echo "To deploy:"
echo "1. Commit everything."
echo "2. Push to GitHub."
echo "3. Go to Repo Settings -> Pages."
echo "4. Select 'Deploy from branch' -> 'gh-pages' (or manually upload 'out' folder if using actions)."
