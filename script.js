// ======================================
// HCI EXPERIMENT 11 - DROP SPACE
// Drag-and-Drop File Upload Interface
// ======================================

const dropZone = document.getElementById("dropZone");
const dropTitle = document.getElementById("dropTitle");

const fileInput = document.getElementById("fileInput");
const browseButton = document.getElementById("browseButton");

const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");
const fileCount = document.getElementById("fileCount");

const clearButton = document.getElementById("clearButton");
const uploadButton = document.getElementById("uploadButton");

const statusMessage = document.getElementById("statusMessage");

const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");


// Configuration

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "txt",
    "doc",
    "docx"
];

let selectedFiles = [];
let nextId = 1;
let uploading = false;


// ======================================
// HELPER FUNCTIONS
// ======================================

// Get file extension

function getExtension(filename) {
    const parts = filename.split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts.pop().toLowerCase();
}


// Format file size

function formatSize(bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


// Display feedback messages

function showMessage(message, type = "") {
    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}


// ======================================
// FILE VALIDATION
// ======================================

function addFiles(fileCollection) {

    if (uploading) {
        showMessage(
            "Please wait until the current demo upload finishes.",
            "error"
        );

        return;
    }

    const incomingFiles = Array.from(fileCollection);

    if (incomingFiles.length === 0) {
        return;
    }

    const acceptedFiles = [];
    const errors = [];

    incomingFiles.forEach(file => {

        const extension = getExtension(file.name);

        // Validate file type

        if (!ALLOWED_EXTENSIONS.includes(extension)) {

            errors.push(
                file.name + ": unsupported file type."
            );

            return;
        }

        // Validate file size

        if (file.size > MAX_SIZE) {

            errors.push(
                file.name + ": file exceeds 10 MB."
            );

            return;
        }

        // Avoid duplicate files

        const alreadyExists = selectedFiles.some(item => {
            return (
                item.file.name === file.name &&
                item.file.size === file.size &&
                item.file.lastModified === file.lastModified
            );
        });

        if (alreadyExists) {

            errors.push(
                file.name + ": file already selected."
            );

            return;
        }

        acceptedFiles.push({
            id: nextId++,
            file: file,
            state: "Ready"
        });

    });

    selectedFiles.push(...acceptedFiles);

    renderFiles();

    if (errors.length > 0) {

        const visibleErrors = errors.slice(0, 3).join(" ");

        showMessage(
            visibleErrors +
            (errors.length > 3 ? " Check the remaining files too." : ""),
            "error"
        );

    } else if (acceptedFiles.length > 0) {

        showMessage(
            acceptedFiles.length +
            " file(s) added successfully.",
            "success"
        );

    } else {

        showMessage("No new valid files were added.", "error");
    }
}


// ======================================
// DISPLAY SELECTED FILES
// ======================================

function renderFiles() {

    fileList.replaceChildren();

    fileCount.textContent = selectedFiles.length;

    emptyState.hidden = selectedFiles.length > 0;

    if (selectedFiles.length === 0) {
        fileList.appendChild(emptyState);
    }

    clearButton.disabled =
        selectedFiles.length === 0 || uploading;

    uploadButton.disabled =
        selectedFiles.length === 0 || uploading;

    selectedFiles.forEach(item => {

        const file = item.file;

        // File row

        const row = document.createElement("div");
        row.className = "file-item";

        // File icon or image preview

        const icon = document.createElement("div");
        icon.className = "file-icon";

        const extension = getExtension(file.name);

        if (file.type.startsWith("image/")) {

            const image = document.createElement("img");

            image.src = URL.createObjectURL(file);
            image.alt = "Preview of " + file.name;

            icon.appendChild(image);

        } else {

            icon.textContent = extension || "FILE";
        }

        // File information

        const info = document.createElement("div");
        info.className = "file-info";

        const name = document.createElement("div");
        name.className = "file-name";
        name.textContent = file.name;
        name.title = file.name;

        const meta = document.createElement("div");
        meta.className = "file-meta";

        meta.textContent =
            formatSize(file.size) +
            " · " +
            (file.type || "Unknown file type");

        const state = document.createElement("div");
        state.className = "file-status";
        state.textContent = item.state;

        info.append(name, meta, state);

        // Remove button

        const removeButton = document.createElement("button");

        removeButton.className = "remove-button";
        removeButton.type = "button";
        removeButton.textContent = "×";

        removeButton.title = "Remove " + file.name;

        removeButton.setAttribute(
            "aria-label",
            "Remove " + file.name
        );

        removeButton.disabled = uploading;

        removeButton.addEventListener("click", () => {

            selectedFiles = selectedFiles.filter(selected => {
                return selected.id !== item.id;
            });

            renderFiles();

            showMessage("File removed from the selection.");
        });

        row.append(icon, info, removeButton);

        fileList.appendChild(row);

    });
}


// ======================================
// DRAG AND DROP EVENTS
// ======================================

// Prevent the browser's default file-opening behavior.

function preventDefaults(event) {
    event.preventDefault();
}


// Prevent files dropped anywhere on the page
// from opening in the browser.

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {

    document.addEventListener(eventName, event => {
        event.preventDefault();
    });

});


// Highlight the drop zone when a file enters.

["dragenter", "dragover"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        preventDefaults(event);

        dropZone.classList.add("drag-over");

        dropTitle.textContent = "Release to add your files";

    });

});


// Restore the normal appearance when dragging ends.

["dragleave", "drop"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        preventDefaults(event);

        dropZone.classList.remove("drag-over");

        dropTitle.textContent = "Drop your files here";

    });

});


// Read dropped files.

dropZone.addEventListener("drop", event => {

    const files = event.dataTransfer.files;

    addFiles(files);

});


// ======================================
// BROWSE FILES
// ======================================

browseButton.addEventListener("click", event => {

    event.stopPropagation();

    fileInput.click();

});


// Clicking the drop zone opens the file picker.

dropZone.addEventListener("click", event => {

    if (event.target.closest("button")) {
        return;
    }

    fileInput.click();

});


// Keyboard accessibility.

dropZone.addEventListener("keydown", event => {

    if (
        event.target !== dropZone ||
        (event.key !== "Enter" && event.key !== " ")
    ) {
        return;
    }

    event.preventDefault();

    fileInput.click();

});


// Handle files selected using the browse dialog.

fileInput.addEventListener("change", () => {

    addFiles(fileInput.files);

    // Allows the same file to be selected again later.

    fileInput.value = "";

});


// ======================================
// CLEAR ALL FILES
// ======================================

clearButton.addEventListener("click", () => {

    if (uploading) {
        return;
    }

    selectedFiles = [];

    progressSection.hidden = true;

    progressBar.style.width = "0%";

    renderFiles();

    showMessage("All selected files have been cleared.");

});


// ======================================
// SIMULATED UPLOAD
// ======================================

uploadButton.addEventListener("click", () => {

    if (selectedFiles.length === 0 || uploading) {
        return;
    }

    uploading = true;

    progressSection.hidden = false;

    progressBar.style.width = "0%";

    progressText.textContent = "Preparing demo upload...";

    progressPercent.textContent = "0%";

    showMessage(
        "Simulating upload progress. No files are being sent to a server."
    );

    selectedFiles.forEach(item => {
        item.state = "Uploading...";
    });

    renderFiles();

    let progress = 0;

    const timer = setInterval(() => {

        progress += 5;

        progressBar.style.width = progress + "%";

        progressPercent.textContent = progress + "%";

        progressText.textContent = "Simulated upload progress...";

        if (progress >= 100) {

            clearInterval(timer);

            uploading = false;

            selectedFiles.forEach(item => {
                item.state = "Complete (demo)";
            });

            renderFiles();

            progressText.textContent = "Demo upload complete!";

            progressPercent.textContent = "100%";

            showMessage(
                "Success! The simulated upload is complete.",
                "success"
            );
        }

    }, 150);

});


// ======================================
// INITIALIZE APPLICATION
// ======================================

renderFiles();