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

function initializeApp() {
  console.log("App initialized");
  // Add app initialization logic here
}

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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("decks-page-button").addEventListener("click", () => {
    window.location.href = "decks.html";
  });
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
      {
        headers: { "X-Api-Key": apiKey },
      }
    );
    const data = await response.json();

    const cards = data.data;
    displaySearchResults(cards);
  } catch (error) {
    console.error("Error fetching card data:", error);
    resultsGrid.innerHTML = "<p>Failed to fetch cards. Please try again.</p>";
  }
});

async function showEvolutions(cardId, cardName) {
  try {
    // Fetch card details
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards/${cardId}`,
      {
        headers: { "X-Api-Key": apiKey },
      }
    );
    const cardData = await response.json();
    const card = cardData.data;

    // Build the evolution query
    const evolvesFrom = card.evolvesFrom ? `"${card.evolvesFrom}"` : null;
    const evolvesTo =
      card.evolvesTo?.map((evolution) => `"${evolution}"`) || [];
    let query = "";

    if (evolvesFrom) query += `name:${evolvesFrom}`;
    if (evolvesTo.length > 0) {
      if (query) query += " OR ";
      query += evolvesTo.map((evolution) => `name:${evolution}`).join(" OR ");
    }

    if (!query) {
      alert(`No evolution data available for ${cardName}.`);
      return;
    }

    // Retain the user's original format or default to "standard"
    const format = formatSelect?.value || "standard";
    query += ` AND legalities.${format}:legal`;

    // Fetch evolution-related cards
    const evolutionResponse = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${query}`,
      { headers: { "X-Api-Key": apiKey } }
    );
    const evolutionData = await evolutionResponse.json();

    // Close the overlay
    const overlay = document.querySelector(".overlay");
    if (overlay) {
      document.body.removeChild(overlay);
    }

    // Display the results in the search grid
    displaySearchResults(evolutionData.data);
    document.getElementById("search-section").scrollIntoView();
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    alert("Failed to retrieve evolution data. Please try again.");
  }
}

function displaySearchResults(cards) {
  const resultsGrid = document.getElementById("results-grid");
  const resultsCount = document.getElementById("results-count");

  resultsGrid.innerHTML = ""; // Clear previous results
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
}

// Initialize Views on Load
window.onload = async () => {
  await fetchPokemonCatalog();
  await fetchTrainerCatalog();
};

// Show the save deck dialog
function showSaveDeckDialog() {
  const dialog = document.getElementById("save-deck-dialog");
  const dropdown = document.getElementById("folder-dropdown");

  // Populate dropdown with existing decks
  const savedDecks = getAllDecks(); // Function from localstorage.js
  dropdown.innerHTML = '<option value="">Select a Deck to Overwrite</option>';
  Object.keys(savedDecks).forEach((deckName) => {
    const option = document.createElement("option");
    option.value = deckName;
    option.textContent = deckName;
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
  const newDeckName = document.getElementById("deck-name-input").value.trim();
  const selectedDeckName = document.getElementById("folder-dropdown").value;

  // Ensure only one input is used
  if (newDeckName && selectedDeckName) {
    alert("Please use either the input field or the dropdown, not both.");
    return;
  }

  // Validate input
  if (!newDeckName && !selectedDeckName) {
    alert("Please provide a name for the deck.");
    return;
  }

  const deckName = newDeckName || selectedDeckName; // Use the input or selected value

  // Retrieve current cards from the deck grid
  const deckGrid = document.getElementById("deck-grid");
  const cards = Array.from(deckGrid.children).map((card) => ({
    id: card.dataset.id,
    name: card.querySelector(".card-info p").textContent.split(" [")[0].trim(),
    count: parseInt(card.querySelector(".count").textContent),
    image: card.querySelector("img").src,
  }));

  // Save or update the deck
  saveDeckToLocalStorage(deckName, cards);

  alert(`Deck "${deckName}" has been ${newDeckName ? "created" : "updated"}.`);
  hideSaveDeckDialog();
}

// Save deck to localStorage
function saveDeckToLocalStorage(deckName, cards) {
  const savedDecks = getAllDecks();
  savedDecks[deckName] = cards; // Update the deck with new cards
  localStorage.setItem("savedDecks", JSON.stringify(savedDecks));
}

// Attach dialog event listeners
document
  .getElementById("save-deck-confirm")
  .addEventListener("click", saveDeck);
document
  .getElementById("save-dialog-cancel")
  .addEventListener("click", hideSaveDeckDialog);

// Show dialog when "Save Deck" button is clicked
document
  .getElementById("save-deck-button")
  .addEventListener("click", showSaveDeckDialog);

function initializeApp() {
  const deckGrid = document.getElementById("deck-grid");

  // Load the current deck
  loadCurrentDeckToGrid(deckGrid);

  // Attach other event listeners, like for saving decks
  document
    .getElementById("save-deck-button")
    .addEventListener("click", showSaveDeckDialog);

  // Dark Mode Initialization
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

    // Load the current deck into the deck grid
    function loadCurrentDeckToGrid(deckGrid) {
      const currentDeck = JSON.parse(localStorage.getItem("deckList")); // Retrieve the deck
      if (!currentDeck) {
        console.warn("No deck loaded from localStorage.");
        return;
      }

      deckGrid.innerHTML = ""; // Clear the grid

      currentDeck.forEach((card) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.dataset.id = card.id;

        cardDiv.innerHTML = `
      <div class="card-info">
        <p>${card.name} [<span class="count">${card.count}</span>]</p>
        <div class="button-container">
          <button class="remove-button" onclick="removeFromDeck('${card.id}')">Remove 1</button>
        </div>
      </div>
      <div class="card-stack">
        <img src="${card.image}" alt="${card.name}">
      </div>
    `;

        deckGrid.appendChild(cardDiv);
      });
    }
  });
}
document.addEventListener("DOMContentLoaded", initializeApp);
