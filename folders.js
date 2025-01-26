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

    // Add event listener to show the dialog when clicking the folder
    folderDiv.addEventListener("click", () => {
      showDeckDialog(deckName, deck); // Open the dialog with deck-specific actions
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

// Show the dialog for the selected deck
function showDeckDialog(deckName, deck) {
  const dialog = document.getElementById("deck-dialog");
  dialog.classList.remove("hidden");

  // Load Deck button
  const loadDeckButton = document.getElementById("load-deck-btn");
  loadDeckButton.onclick = () => {
    localStorage.setItem("deckList", JSON.stringify(deck));
    alert(`Deck "${deckName}" loaded.`);
    window.location.href = "index.html"; // Redirect to deckbuilder
  };

  // Delete Deck button
  const deleteDeckButton = document.getElementById("delete-deck-btn");
  deleteDeckButton.onclick = () => {
    if (confirm(`Are you sure you want to delete the deck "${deckName}"?`)) {
      deleteDeck(deckName);
      alert(`Deck "${deckName}" deleted.`);
      initializeDecksPage(); // Refresh the deck list
      dialog.classList.add("hidden"); // Close the dialog after deletion
    }
  };

  // Primer button
  const primerButton = document.getElementById("primer-btn");
  primerButton.onclick = () => {
    alert(`Opening primer for "${deckName}"...`);
    // Placeholder: Add navigation logic for the Primer page
  };

  // Close button
  const closeDialogButton = document.getElementById("close-dialog");
  closeDialogButton.onclick = () => {
    dialog.classList.add("hidden");
  };
}

// Helper functions for deck management
function deleteDeck(deckName) {
  const decks = getAllDecks();
  delete decks[deckName];
  localStorage.setItem("savedDecks", JSON.stringify(decks));
}

function getAllDecks() {
  return JSON.parse(localStorage.getItem("savedDecks")) || {};
}

function saveDeck(deckName, deck) {
  const decks = getAllDecks();
  decks[deckName] = deck;
  localStorage.setItem("savedDecks", JSON.stringify(decks));
}

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
