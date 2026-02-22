# BUILD & PUBLISH GUIDE

## Prerequisites

* Node.js 20+
* npm or yarn
* VS Code 1.85+
* vsce (VS Code Extension CLI)

## Build Steps

### 1. Install Dependencies

```bash
# Root (MCP Server)
npm install

# Extension
cd extension
npm install
cd ..
```

### 2. Build MCP Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in `dist/` folder.

### 3. Copy Server to Extension

```bash
npm run copy-to-extension
```

This copies `dist/` → `extension/mcp-server/`

### 4. Build Extension

```bash
cd extension
npm run compile
```

This compiles extension TypeScript to JavaScript in `extension/dist/`

### 5. Verify Icon

Ensure `extension/icon.png` exists (128x128 PNG).

If not, create from SVG:

```bash
cd extension
convert icon.svg -resize 128x128 -background none icon.png
```

### 6. Package Extension

```bash
cd extension
npm run package
```

This creates `pdf-utilities-1.0.0.vsix` file.

### 7. Test Locally

Install the VSIX in VS Code:
1. Open VS Code
2. Extensions panel (Cmd+Shift+X)
3. Click "..." menu
4. Select "Install from VSIX..."
5. Choose `pdf-utilities-1.0.0.vsix`

Test all features:
* Extension activates
* MCP server registers
* Tools available in Copilot Chat
* Commands work

## Publish to Marketplace

### First Time Setup

1. Create Publisher Account:
   - Go to https://marketplace.visualstudio.com/
   - Click "Publish extensions"
   - Create publisher (use same ID as in package.json)

2. Generate Personal Access Token (PAT):
   - Go to https://dev.azure.com/
   - Click User Settings → Personal Access Tokens
   - Create new token with "Marketplace (Manage)" scope
   - Copy token (you won't see it again!)

3. Update `.env`:
   

```
   VSCE_PAT=your_token_here
   ```

### Publishing

```bash
cd extension

# Login with your token (first time only)
npx vsce login GleidsonFerSanP

# Publish
npm run publish
```

Or manually:

```bash
npx vsce publish -p YOUR_PAT_TOKEN
```

### Version Updates

When publishing updates:

1. Update version in both:
   - `package.json` (root)
   - `extension/package.json`

2. Update `extension/CHANGELOG.md`:
   

```markdown
   ## [1.1.0] - 2026-XX-XX
   ### Added
   - New feature...
   ```

3. Rebuild and publish:
   

```bash
   npm run build
   npm run copy-to-extension
   cd extension
   npm run compile
   npm run package
   npm run publish
   ```

## Troubleshooting

### "vsce not found"

```bash
npm install -g @vscode/vsce
```

### "Missing icon.png"

```bash
cd extension
# Use ImageMagick
convert icon.svg -resize 128x128 icon.png

# Or use sharp
npm install sharp
node -e "require('sharp')('icon.svg').resize(128,128).png().toFile('icon.png')"
```

### "MCP server not found"

Ensure you ran:

```bash
npm run build
npm run copy-to-extension
```

Check that `extension/mcp-server/index.js` exists.

### TypeScript Errors

```bash
# Clean and rebuild
rm -rf dist extension/dist extension/mcp-server
npm run build
npm run copy-to-extension
cd extension
npm run compile
```

### Package Size Too Large

Check `.vscodeignore` excludes:
* `src/` (source files)
* `node_modules/` (dependencies, except runtime ones)
* `.DS_Store`,  `.gitignore`
* Development files

## Continuous Integration

### GitHub Actions (Optional)

Create `.github/workflows/publish.yml` :

```yaml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install and Build
        run: |
          npm install
          npm run build
          npm run copy-to-extension
          cd extension
          npm install
          npm run compile
      
      - name: Publish
        run: |
          cd extension
          npx vsce publish -p ${{ secrets.VSCE_PAT }}
```

Add `VSCE_PAT` to GitHub repository secrets.

## Quality Checks

Before publishing:

* [ ] All TypeScript compiles without errors
* [ ] No high-severity security vulnerabilities (`npm audit`)
* [ ] Icon is 128x128 PNG
* [ ] README is complete and accurate
* [ ] CHANGELOG is updated
* [ ] Version numbers match in both package.json files
* [ ] Extension activates without errors
* [ ] MCP server registers successfully
* [ ] All 7 tools work correctly
* [ ] Commands execute properly
* [ ] No console errors in Output panel

## Post-Publish

1. Verify on marketplace:
   https://marketplace.visualstudio.com/items?itemName=GleidsonFerSanP.pdf-utilities

2. Test installation from marketplace:
   - Open VS Code
   - Search for "PDF Utilities"
   - Install
   - Verify it works

3. Monitor:
   - Download stats
   - User reviews
   - Issue reports

4. Update GitHub repository:
   - Tag release: `git tag v1.0.0 && git push --tags`

   - Create GitHub Release with notes
   - Attach .vsix file to release

## Support

For issues:
* Check Output panel: "PDF Utilities"
* Review logs
* File issue on GitHub

For questions:
* See README.md
* Check documentation
* Contact publisher
