// Global variable to hold the Monaco editor instance
let editor;

// In-memory representation of files.
// Each file has a name, content, and language (for Monaco syntax highlighting).
let files = [
    {
        name: 'index.html',
        content: `<!DOCTYPE html>
<html>
<head>
    <title>My Awesome App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello from your IDE!</h1>
    <p>Start coding here. Changes will appear live in the preview.</p>
    <button id="myButton">Click Me</button>
    <script src="script.js"></script>
</body>
</html>`,
        language: 'html'
    },
    {
        name: 'style.css',
        content: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #282c34; /* Dark background */
    color: #abb2bf; /* Light grey text */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
}

h1 {
    color: #61afef; /* Blue heading */
}

p {
    color: #98c379; /* Green paragraph */
    font-size: 1.1em;
}

#myButton {
    background-color: #c678dd; /* Purple button */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-top: 20px;
    transition: background-color 0.3s ease;
}

#myButton:hover {
    background-color: #a655cb;
}`,
        language: 'css'
    },
    {
        name: 'script.js',
        content: `document.addEventListener('DOMContentLoaded', () => {
    const myButton = document.getElementById('myButton');
    if (myButton) {
        myButton.addEventListener('click', () => {
            alert('Button clicked! You can also use console.log in the preview console.');
            console.log('Button was clicked!');
        });
    }
});`,
        language: 'javascript'
    }
];

// Set the initial active file to the first one in the array
let currentFile = files[0];

/**
 * Updates the file list displayed in the sidebar.
 * Clears the existing list and recreates it based on the 'files' array.
 * Also applies 'active' class to the currently open file.
 */
function updateFileList() {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = ''; // Clear existing list items

    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.dataset.filename = file.name; // Store filename as a data attribute

        // Add 'active' class if this is the currently open file
        if (file.name === currentFile.name) {
            li.classList.add('active');
        }

        // Create and append a delete button for each file
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'x'; // Simple 'x' for delete
        deleteBtn.classList.add('delete-btn');
        // Stop propagation to prevent the li's click event from firing when deleting
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            deleteFile(file.name);
        };
        li.appendChild(deleteBtn);

        // Attach click event listener to open the file
        li.onclick = () => openFile(file.name);
        fileListElement.appendChild(li);
    });
}

/**
 * Opens a specified file in the Monaco editor.
 * Saves the content of the previously active file before switching.
 * Updates the editor's value and language mode.
 *
 * @param {string} filename - The name of the file to open.
 */
function openFile(filename) {
    // Save the content of the current file back to the 'files' array
    if (editor && currentFile) {
        currentFile.content = editor.getValue();
    }

    // Find the file to open in the 'files' array
    const fileToOpen = files.find(file => file.name === filename);

    if (fileToOpen) {
        currentFile = fileToOpen; // Set the new current file
        editor.setValue(currentFile.content); // Update editor content
        // Set the editor's language mode based on the file's language
        monaco.editor.setModelLanguage(editor.getModel(), currentFile.language);
        updateFileList(); // Refresh the file list to show the new active file
        updatePreview(); // Update the preview to reflect changes
    }
}

/**
 * Prompts the user for a new file name, adds it to the in-memory file system,
 * and opens it in the editor.
 */
function addFile() {
    let newFileName = prompt("Enter new file name (e.g., script.js, style.css, index.html):");
    if (newFileName && newFileName.trim() !== '') {
        newFileName = newFileName.trim();
        // Check if a file with this name already exists
        if (files.some(f => f.name === newFileName)) {
            // Using a custom message box instead of alert() as per instructions
            displayMessageBox("Error", "File with this name already exists!");
            return;
        }

        // Determine the language based on file extension
        const extension = newFileName.split('.').pop();
        let language = 'plaintext'; // Default language
        if (extension === 'js') language = 'javascript';
        else if (extension === 'css') language = 'css';
        else if (extension === 'html') language = 'html';
        else if (extension === 'json') language = 'json';
        else if (extension === 'md') language = 'markdown';
        else if (extension === 'ts') language = 'typescript';

        // Create the new file object
        const newFile = {
            name: newFileName,
            content: '', // New files start empty
            language: language
        };
        files.push(newFile); // Add to the files array
        updateFileList(); // Refresh the file list UI
        openFile(newFileName); // Automatically open the newly created file
    }
}

/**
 * Deletes a specified file from the in-memory file system.
 * Prevents deleting the last file.
 *
 * @param {string} filename - The name of the file to delete.
 */
function deleteFile(filename) {
    // Prevent deleting the last file
    if (files.length === 1) {
        displayMessageBox("Cannot Delete", "You cannot delete the last file!");
        return;
    }

    // Custom confirmation dialog instead of window.confirm()
    showConfirmBox(`Are you sure you want to delete "${filename}"?`, () => {
        files = files.filter(file => file.name !== filename); // Filter out the deleted file

        // If the deleted file was the active one, switch to the first remaining file
        if (currentFile.name === filename) {
            currentFile = files[0];
            editor.setValue(currentFile.content);
            monaco.editor.setModelLanguage(editor.getModel(), currentFile.language);
        }
        updateFileList(); // Refresh UI
        updatePreview(); // Update preview
    });
}

/**
 * Updates the content of the iframe preview.
 * It combines HTML, CSS, and JavaScript from all files into a single HTML document.
 */
function updatePreview() {
    const previewFrame = document.getElementById('previewFrame');

    // Extract content for different file types
    const htmlContent = files.find(f => f.language === 'html')?.content || '';
    const cssContent = files.filter(f => f.language === 'css').map(f => `<style>${f.content}</style>`).join('\n');
    const jsContent = files.filter(f => f.language === 'javascript').map(f => `<script>${f.content}</script>`).join('\n');

    // Construct a complete HTML document for the iframe's srcdoc
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                /* Basic styling for the iframe's body to ensure readability */
                body { margin: 0; padding: 10px; font-family: sans-serif; background-color: #fff; color: #333; }
            </style>
            ${cssContent}
        </head>
        <body>
            ${htmlContent}
            ${jsContent}
        </body>
        </html>
    `;
    previewFrame.srcdoc = fullHtml; // Set the iframe's content
}

/**
 * Displays a custom message box.
 * @param {string} title - The title of the message box.
 * @param {string} message - The message to display.
 */
function displayMessageBox(title, message) {
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;

    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        background: #252526; padding: 20px; border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); max-width: 400px;
        text-align: center; color: #eee;
    `;

    const messageTitle = document.createElement('h4');
    messageTitle.textContent = title;
    messageTitle.style.cssText = `margin-top: 0; color: #007acc;`;

    const messageContent = document.createElement('p');
    messageContent.textContent = message;
    messageContent.style.cssText = `margin-bottom: 20px;`;

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        background-color: #007acc; color: white; border: none;
        padding: 10px 20px; border-radius: 5px; cursor: pointer;
        font-size: 1em; transition: background-color 0.2s ease;
    `;
    okButton.onmouseover = () => okButton.style.backgroundColor = '#005f99';
    okButton.onmouseout = () => okButton.style.backgroundColor = '#007acc';
    okButton.onclick = () => document.body.removeChild(modalOverlay);

    messageBox.appendChild(messageTitle);
    messageBox.appendChild(messageContent);
    messageBox.appendChild(okButton);
    modalOverlay.appendChild(messageBox);
    document.body.appendChild(modalOverlay);
}

/**
 * Displays a custom confirmation box.
 * @param {string} message - The confirmation message.
 * @param {function} onConfirm - Callback function if user confirms.
 */
function showConfirmBox(message, onConfirm) {
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;

    const confirmBox = document.createElement('div');
    confirmBox.style.cssText = `
        background: #252526; padding: 20px; border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); max-width: 400px;
        text-align: center; color: #eee;
    `;

    const confirmContent = document.createElement('p');
    confirmContent.textContent = message;
    confirmContent.style.cssText = `margin-bottom: 20px;`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `display: flex; justify-content: center; gap: 10px;`;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Yes';
    confirmButton.style.cssText = `
        background-color: #007acc; color: white; border: none;
        padding: 10px 20px; border-radius: 5px; cursor: pointer;
        font-size: 1em; transition: background-color 0.2s ease;
    `;
    confirmButton.onmouseover = () => confirmButton.style.backgroundColor = '#005f99';
    confirmButton.onmouseout = () => confirmButton.style.backgroundColor = '#007acc';
    confirmButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        if (onConfirm) onConfirm();
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'No';
    cancelButton.style.cssText = `
        background-color: #6c757d; color: white; border: none;
        padding: 10px 20px; border-radius: 5px; cursor: pointer;
        font-size: 1em; transition: background-color 0.2s ease;
    `;
    cancelButton.onmouseover = () => cancelButton.style.backgroundColor = '#5a6268';
    cancelButton.onmouseout = () => cancelButton.style.backgroundColor = '#6c757d';
    cancelButton.onclick = () => document.body.removeChild(modalOverlay);

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);
    confirmBox.appendChild(confirmContent);
    confirmBox.appendChild(buttonContainer);
    modalOverlay.appendChild(confirmBox);
    document.body.appendChild(modalOverlay);
}


// Initialize Monaco Editor
// This configures the loader to find Monaco's files from the unpkg CDN.
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.47.0/min/vs' }});

// Once the Monaco loader is ready, initialize the editor
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: currentFile.content, // Set initial content from currentFile
        language: currentFile.language, // Set initial language
        theme: 'vs-dark', // Use the dark theme for the editor
        automaticLayout: true, // Automatically resize the editor when its container changes size
        minimap: { enabled: false } // Disable minimap for cleaner look in this basic version
    });

    // Listen for changes in the editor content
    editor.onDidChangeModelContent(() => {
        currentFile.content = editor.getValue(); // Update the content in our in-memory file system
        updatePreview(); // Refresh the live preview
    });

    // Perform initial setup: populate file list and update preview
    updateFileList();
    updatePreview();
});

// Add event listener for the "Add File" button
document.getElementById('addFileBtn').addEventListener('click', addFile);
