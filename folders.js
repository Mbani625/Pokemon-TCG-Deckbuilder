function initializeDecksPage() {
  const container = document.getElementById("deck-folders-container");

  if (!container) {
    console.error("Error: 'deck-folders-container' not found in the DOM.");
    return;
  }

  const decks = getAllDecks(); // Retrieve decks from localStorage

  container.innerHTML = ""; // Clear the container

  Object.keys(decks).forEach((deckName) => {
    const deck = decks[deckName]; // Get the deck array
    const cardCount = deck.reduce(
      (total, card) => total + (card.count || 0),
      0
    ); // Sum card counts

    // Create the folder container
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";
    folderDiv.setAttribute("role", "button"); // Accessibility enhancement
    folderDiv.tabIndex = 0; // Make it focusable for keyboard users

    // Add event listener to load the deck when clicking anywhere on the folder
    folderDiv.addEventListener("click", () => {
      localStorage.setItem("deckList", JSON.stringify(deck)); // Save deck to localStorage
      alert(`Deck "${deckName}" loaded.`);
      window.location.href = "index.html"; // Redirect to index.html
    });

    // Create the folder button (icon)
    const folderButton = document.createElement("button");
    folderButton.className = "folder-icon";
    folderButton.textContent = "📁"; // Folder emoji

    // Create the folder label with card count
    const folderLabel = document.createElement("span");
    folderLabel.className = "folder-label";
    folderLabel.textContent = `${deckName} (${cardCount} cards)`; // Add card count in brackets

    // Append the button and label to the folder container
    folderDiv.appendChild(folderButton);
    folderDiv.appendChild(folderLabel);

    // Append the folder container to the main container
    container.appendChild(folderDiv);
  });

  // Add an option to create a new deck
  const newDeckDiv = document.createElement("div");
  newDeckDiv.className = "create-new-deck";
  newDeckDiv.innerHTML = `<button id="create-new-deck-button">Create New Deck</button>`;
  container.appendChild(newDeckDiv);

  document
    .getElementById("create-new-deck-button")
    .addEventListener("click", () => {
      const newDeckName = prompt("Enter a name for your new deck:");
      if (!newDeckName) {
        alert("Deck name cannot be empty.");
        return;
      }

      const savedDecks = getAllDecks();
      if (savedDecks[newDeckName]) {
        alert(
          "A deck with this name already exists. Please choose a different name."
        );
        return;
      }

      saveDeck(newDeckName, []);
      alert(`New deck "${newDeckName}" has been created.`);
      initializeDecksPage(); // Refresh the deck list
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Check for saved preference in localStorage
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggleButton.classList.add("dark-mode");
    toggleButton.textContent = "☀️ Light Mode";
  }

  // Toggle Dark Mode
  toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    toggleButton.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      toggleButton.textContent = "☀️ Light Mode";
    } else {
      localStorage.setItem("darkMode", "disabled");
      toggleButton.textContent = "🌙 Dark Mode";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("index-page-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  } else {
    console.error("Error: 'index-page-button' not found in the DOM.");
  }
});

document.addEventListener("DOMContentLoaded", initializeDecksPage);
