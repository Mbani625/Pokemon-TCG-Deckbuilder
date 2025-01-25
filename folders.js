// Navigate back to the main index page
document.getElementById("index-page-button").addEventListener("click", () => {
  window.location.href = "index.html";
});

// Initialize deck folders
function loadDeckFolders() {
  const folders = JSON.parse(localStorage.getItem("deckFolders")) || [];
  const container = document.getElementById("deck-folders-container");
  container.innerHTML = "";

  folders.forEach((folder) => {
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";
    folderDiv.textContent = folder;
    folderDiv.addEventListener("click", () => loadDeckFromFolder(folder));
    container.appendChild(folderDiv);
  });
}

// Add a new folder
document.getElementById("add-folder-button").addEventListener("click", () => {
  const folderName = document.getElementById("new-folder-name").value.trim();
  if (!folderName) {
    alert("Please enter a valid folder name.");
    return;
  }

  const folders = JSON.parse(localStorage.getItem("deckFolders")) || [];
  if (folders.includes(folderName)) {
    alert("Folder already exists.");
    return;
  }

  folders.push(folderName);
  localStorage.setItem("deckFolders", JSON.stringify(folders));
  loadDeckFolders();
});

// Load a deck from a folder
function loadDeckFromFolder(folderName) {
  const deckData = JSON.parse(localStorage.getItem(folderName));
  if (deckData) {
    localStorage.setItem("deckList", JSON.stringify(deckData));
    window.location.href = "index.html";
  } else {
    alert("No deck found in this folder.");
  }
}

// Maintain dark mode setting
function setupDarkMode() {
  const body = document.body;
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Apply the saved dark mode setting
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
  }

  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const darkModeEnabled = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", darkModeEnabled ? "enabled" : "disabled");
  });
}

// Load folders and setup dark mode on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDeckFolders();
  setupDarkMode();
});
