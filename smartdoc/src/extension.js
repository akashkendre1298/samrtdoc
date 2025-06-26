const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function showMsg(msg) {
  vscode.window.showInformationMessage(`[SmartDoc] ${msg}`);
}

function getWorkspaceRoot() {
  const folders = vscode.workspace.workspaceFolders;
  return folders && folders.length ? folders[0].uri.fsPath : null;
}

async function renderTemplate(templatePath, data) {
  const template = fs.readFileSync(templatePath, 'utf-8');
  return ejs.render(template, data);
}

async function writeDocFile(filename, content, folder = null) {
  const root = getWorkspaceRoot();
  if (!root) return;
  // All docs except README.md go in 'doc' folder
  let filePath = (folder || filename === 'README.md')
    ? (filename === 'README.md' ? path.join(root, filename) : path.join(root, 'doc', filename))
    : path.join(root, filename);
  if (filename !== 'README.md') {
    if (!fs.existsSync(path.join(root, 'doc'))) {
      fs.mkdirSync(path.join(root, 'doc'), { recursive: true });
    }
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  // Open the file in the editor after writing
  const doc = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(doc, { preview: false });
}

async function generateReadme() {
  try {
    const root = getWorkspaceRoot();
    if (!root) {
      showMsg('Error: No workspace folder open. Please open your project root folder, not the smartdoc subfolder.');
      return;
    }
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      showMsg('Error: package.json not found in workspace root. Please open your main project folder, not the smartdoc subfolder.');
      return;
    }
    // Read package.json
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    // Get dependencies
    const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
    const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
    const techStack = deps.concat(devDeps).map(d => `- ${d}`).join('\n') || 'N/A';
    // Folder structure (ignore node_modules, .git, .vscode, etc.)
    const IGNORED = ['node_modules', '.git', '.vscode', 'smartdoc', 'test', 'dist', 'out'];
    function walk(dir, prefix = '') {
      let res = '';
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.name.startsWith('.') || IGNORED.includes(file.name)) continue;
        const full = path.join(dir, file.name);
        const icon = file.isDirectory() ? '📁' : '📄';
        res += `${prefix}${icon} ${file.name}\n`;
        if (file.isDirectory()) {
          res += walk(full, prefix + '  ');
        }
      }
      return res;
    }
    const folderStructure = walk(root);
    // Install & usage
    const installUsage = '```bash\nnpm install\n# Launch in VS Code\ncode .\n```';
    // Features (static for now)
    const features = '- Auto-generates documentation\n- Scans dependencies and structure\n- Customizable templates';
    // Render EJS template
    const templatePath = path.join(root, 'smartdoc', 'templates', 'readme.md.ejs');
    const content = await renderTemplate(templatePath, {
      title: pkg.displayName || pkg.name,
      description: pkg.description || '',
      techStack,
      folderStructure,
      installUsage,
      features
    });
    await writeDocFile('README.md', content);
    showMsg('README.md generated!');
  } catch (err) {
    showMsg('Error generating README.md: ' + err.message);
  }
}

async function generateWorkflow() {
  try {
    const root = getWorkspaceRoot();
    if (!root) {
      showMsg('Error: No workspace folder open. Please open your project root folder, not the smartdoc subfolder.');
      return;
    }
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      showMsg('Error: package.json not found in workspace root. Please open your main project folder, not the smartdoc subfolder.');
      return;
    }
    // User Journey (static for now)
    const userJourney = '- 🧑 User opens the app\n- 🖱️ User triggers an action (e.g., button click)\n- ⚙️ App processes logic\n- 🌐 API request sent\n- 📦 Response handled and UI updated';
    // State Management (static for now)
    const stateManagement = '- Uses local state and/or context\n- Updates state on user actions and API responses';
    // API Flow (static for now)
    const apiFlow = '- Client sends request to backend\n- Backend processes and responds\n- Client updates UI';
    // Render EJS template
    const templatePath = path.join(root, 'smartdoc', 'templates', 'workflow.md.ejs');
    const content = await renderTemplate(templatePath, {
      userJourney,
      stateManagement,
      apiFlow
    });
    await writeDocFile('WORKFLOW.md', content, 'doc');
    showMsg('WORKFLOW.md generated!');
  } catch (err) {
    showMsg('Error generating WORKFLOW.md: ' + err.message);
  }
}

async function generateDocs() {
  try {
    const root = getWorkspaceRoot();
    if (!root) {
      showMsg('Error: No workspace folder open. Please open your project root folder, not the smartdoc subfolder.');
      return;
    }
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      showMsg('Error: package.json not found in workspace root. Please open your main project folder, not the smartdoc subfolder.');
      return;
    }
    // Modules & Components (static for now)
    const modules = '- 📦 Main logic in `src/`\n- 📄 Entry point: `extension.js`';
    // API Endpoints (static for now)
    const apiEndpoints = '- No backend API endpoints detected.';
    // Utilities (static for now)
    const utilities = '- Utility/helper functions in `src/`';
    // Render EJS template
    const templatePath = path.join(root, 'smartdoc', 'templates', 'docs.md.ejs');
    const content = await renderTemplate(templatePath, {
      modules,
      apiEndpoints,
      utilities
    });
    await writeDocFile('DOCS.md', content, 'doc');
    showMsg('DOCS.md generated!');
  } catch (err) {
    showMsg('Error generating DOCS.md: ' + err.message);
  }
}

async function generateFlowchart() {
  try {
    const root = getWorkspaceRoot();
    if (!root) {
      showMsg('Error: No workspace folder open. Please open your project root folder, not the smartdoc subfolder.');
      return;
    }
    // Simple ASCII box-and-arrow flowchart
    const flowchart = `+--------+      +-------------------+      +-------------------+      +-------------------+
| User  |----->| VS Code Command   |----->| SmartDoc Logic     |----->| Generate Docs     |
+--------+      +-------------------+      +-------------------+      +-------------------+`;
    const templatePath = path.join(root, 'smartdoc', 'templates', 'flowchart.mmd.ejs');
    const content = await renderTemplate(templatePath, { flowchart });
    await writeDocFile('FLOWCHART.md', content, 'doc');
    showMsg('FLOWCHART.md generated!');
  } catch (err) {
    showMsg('Error generating FLOWCHART.md: ' + err.message);
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('smartdoc.generateAll', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'README.md will be overwritten. Do you want to continue?',
        { modal: true },
        'Yes', 'No'
      );
      if (confirm !== 'Yes') {
        showMsg('Operation cancelled.');
        return;
      }
      await generateReadme();
      await generateWorkflow();
      await generateDocs();
      await generateFlowchart();
      showMsg('All documentation generated!');
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('smartdoc.readme', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'README.md will be overwritten. Do you want to continue?',
        { modal: true },
        'Yes', 'No'
      );
      if (confirm !== 'Yes') {
        showMsg('Operation cancelled.');
        return;
      }
      await generateReadme();
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
