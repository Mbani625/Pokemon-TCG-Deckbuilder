const apiKey = "YOUR_API_KEY"; // Replace with your Pokémon TCG API key
const formatSelect = document.getElementById("format-select");
const cardTypeSelect = document.getElementById("card-type-select");
const typeDetailSelect = document.getElementById("type-detail-select");
const cardNameInput = document.getElementById("card-name-input");
const autocompleteResults = document.getElementById("autocomplete-results");
const searchButton = document.getElementById("search-button");
const resultsGrid = document.getElementById("results-grid");

const pokemonCatalog = []; // Holds unique Pokémon names
const trainerCatalog = []; // Holds unique Trainer card names
const setCache = {}; // Cache to store setId -> ptcgoCode mappings

async function fetchAndCacheSets() {
  try {
    const response = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": apiKey },
    });
    const data = await response.json();

    data.data.forEach((set) => {
      if (set.id && set.ptcgoCode) {
        setCache[set.id] = set.ptcgoCode; // Map setId to ptcgoCode
      }
    });

    console.log("Set Cache:", setCache); // Debug: Verify cache content
  } catch (error) {
    console.error("Failed to fetch and cache sets:", error);
  }
}

// Fetch and cache sets on page load
document.addEventListener("DOMContentLoaded", fetchAndCacheSets);

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Check for saved preference in localStorage
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggleButton.classList.add("dark-mode");
    toggleButton.textContent = "☀️ Light Mode";
  }
});

// Fetch unique Pokémon names
const fetchPokemonCatalog = async () => {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=10000"
    );
    const data = await response.json();
    data.results.forEach((pokemon) => {
      pokemonCatalog.push(pokemon.name);
    });
    pokemonCatalog.sort(); // Alphabetically sort Pokémon names
  } catch (error) {
    console.error("Error fetching Pokémon catalog:", error);
  }
};

// Fetch unique Trainer card names
const fetchTrainerCatalog = async () => {
  try {
    const response = await fetch(
      "https://api.pokemontcg.io/v2/cards?q=supertype:trainer",
      {
        headers: { "X-Api-Key": apiKey },
      }
    );
    const data = await response.json();
    const uniqueNames = new Set();
    data.data.forEach((card) => {
      uniqueNames.add(card.name); // Add only unique names
    });
    trainerCatalog.push(...Array.from(uniqueNames));
    trainerCatalog.sort(); // Alphabetically sort Trainer card names
  } catch (error) {
    console.error("Error fetching Trainer catalog:", error);
  }
};

// Fetch card details from API
const fetchCardDetails = async (cardId) => {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards/${cardId}`,
      {
        headers: { "X-Api-Key": apiKey },
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching card details:", error);
    return null;
  }
};

// Autocomplete for Pokémon and Trainer names
cardNameInput.addEventListener("input", () => {
  const query = cardNameInput.value.trim().toLowerCase();
  autocompleteResults.innerHTML = ""; // Clear previous results

  if (query.length < 2) {
    autocompleteResults.style.display = "none";
    return;
  }

  const combinedCatalog = [...pokemonCatalog, ...trainerCatalog];
  const filteredNames = combinedCatalog
    .filter((name) => name.toLowerCase().startsWith(query))
    .slice(0, 10);

  if (filteredNames.length > 0) {
    autocompleteResults.style.display = "block";
    filteredNames.forEach((name) => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = name;
      div.addEventListener("click", () => {
        cardNameInput.value = name;
        autocompleteResults.style.display = "none";
      });
      autocompleteResults.appendChild(div);
    });
  } else {
    autocompleteResults.style.display = "none";
  }
});

// Fetch Legal Sets Function
async function fetchLegalSets(format) {
  try {
    const response = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": apiKey },
    });
    const data = await response.json();

    // Filter sets by legality for the selected format
    const legalSets = data.data.filter(
      (set) => set.legalities && set.legalities[format] === "Legal"
    );
    console.log(
      "Legal sets:",
      legalSets.map((set) => set.id)
    ); // Debug: Log legal sets
    return legalSets.map((set) => set.id); // Return only set IDs
  } catch (error) {
    console.error("Error fetching sets:", error);
    return [];
  }
}

document.getElementById("decks-page-button").addEventListener("click", () => {
  window.location.href = "decks.html";
});

// Search Function
searchButton.addEventListener("click", async () => {
  resultsGrid.innerHTML = "";
  const resultsCount = document.getElementById("results-count");
  resultsCount.textContent = "(0)";

  const pokemonName = cardNameInput.value.trim();
  const format = formatSelect.value;
  const cardType = cardTypeSelect.value;

  try {
    let query = `legalities.${format}:legal AND supertype:${cardType}`;
    if (pokemonName) {
      query += ` AND name:"${pokemonName}"`;
    }

    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${query}`,
      { headers: { "X-Api-Key": apiKey } }
    );
    const data = await response.json();

    const cards = data.data;
    resultsCount.textContent = `(${cards.length})`;

    if (cards.length === 0) {
      resultsGrid.innerHTML =
        "<p>No cards match your search criteria in the selected format and type.</p>";
      return;
    }

    cards.forEach((card) => {
      const setId = card.set?.id || "Unknown Set";
      const ptcgoCode = setCache[setId] || "Unknown Code"; // Use cached data
      const sanitizedCardName = card.name.replace(/'/g, "\\'"); // Escape single quotes

      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.id = card.id;
      cardDiv.dataset.type = card.supertype.toLowerCase();
      cardDiv.dataset.rarity = card.rarity || "unknown";
      cardDiv.dataset.setId = setId;
      cardDiv.dataset.ptcgoCode = ptcgoCode;
      cardDiv.dataset.cardNumber = card.number || "Unknown Number";

      cardDiv.innerHTML = `
        <div class="card-image-container">
          <img src="${card.images?.small || ""}" alt="${
        card.name
      }" onclick="displayCardOverlay('${card.id}', '${
        card.images?.large || ""
      }')">
        </div>
        <p><strong>${card.name}</strong></p>
        <li><strong>Set:</strong> ${card.set?.name || "Unknown Set"}</li>
        <li><strong>Number:</strong> ${card.number || "Unknown Number"}</li>
        <div class="button-container">
          <button class="add-button" onclick="addToDeck('${
            card.id
          }', '${sanitizedCardName}', '${card.images?.small || ""}', '${
        card.supertype
      }', '${card.rarity}', '${setId}', '${
        card.number
      }', '${ptcgoCode}')">Add to Deck</button>
        </div>
      `;
      resultsGrid.appendChild(cardDiv);
    });
  } catch (error) {
    console.error("Error fetching card data:", error);
    resultsGrid.innerHTML = "<p>Failed to fetch cards. Please try again.</p>";
  }
});

// Initialize Views on Load
window.onload = async () => {
  await fetchPokemonCatalog();
  await fetchTrainerCatalog();
};

// Show the save deck dialog
function showSaveDeckDialog() {
  const dialog = document.getElementById("save-deck-dialog");
  const dropdown = document.getElementById("folder-dropdown");

  // Populate dropdown with folder names
  const folders = JSON.parse(localStorage.getItem("deckFolders")) || [];
  dropdown.innerHTML = '<option value="">Select a Folder</option>';
  folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    dropdown.appendChild(option);
  });

  dialog.classList.remove("hidden");
}

// Hide the save deck dialog
function hideSaveDeckDialog() {
  const dialog = document.getElementById("save-deck-dialog");
  dialog.classList.add("hidden");
}

// Save the deck when "Save" is clicked
function saveDeck() {
  const deckName = document.getElementById("deck-name-input").value.trim();
  const folderName = document.getElementById("folder-dropdown").value;

  if (!deckName && !folderName) {
    alert("Please enter a deck name or select a folder.");
    return;
  }

  if (deckName && folderName) {
    alert("Please either enter a deck name or select a folder, not both.");
    return;
  }

  if (deckName) {
    saveDeckToFolder(deckName, "Default"); // Use Default folder for unnamed folders
  } else if (folderName) {
    saveDeckToFolder("Unnamed Deck", folderName); // Use a default name for unnamed decks
  }

  hideSaveDeckDialog();
}

// Attach event listeners
function setupEventListeners() {
  document
    .getElementById("save-deck-button")
    .addEventListener("click", showSaveDeckDialog);
  document
    .getElementById("save-dialog-cancel")
    .addEventListener("click", hideSaveDeckDialog);
  document
    .getElementById("save-deck-confirm")
    .addEventListener("click", saveDeck);
}

function initializeApp() {
  loadDeckFromLocalStorage();
  setupEventListeners();

  // Maintain dark mode setting
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️ Light Mode";
  }

  darkModeToggle.addEventListener("click", () => {
    const isDarkMode = body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    darkModeToggle.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  });

  console.log("Application initialized.");
}

// Run the initialization on page load
document.addEventListener("DOMContentLoaded", initializeApp);
