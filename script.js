const apiKey = "YOUR_API_KEY"; // Replace with your Pokémon TCG API key
const formatSelect = document.getElementById("format-select");
const cardTypeSelect = document.getElementById("card-type-select");
const typeDetailSelect = document.getElementById("type-detail-select");
const cardNameInput = document.getElementById("card-name-input");
const autocompleteResults = document.getElementById("autocomplete-results");
const searchButton = document.getElementById("search-button");
const resultsGrid = document.getElementById("results-grid");
const deckGrid = document.getElementById("deck-grid");
const pokemonCatalog = []; // Holds unique Pokémon names
const trainerCatalog = []; // Holds unique Trainer card names

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

// Search Function
searchButton.addEventListener("click", async () => {
  // Clear previous results
  resultsGrid.innerHTML = "";
  const resultsCount = document.getElementById("results-count");
  resultsCount.textContent = "(0)";

  const pokemonName = cardNameInput.value.trim(); // Full card name typed in
  const format = formatSelect.value; // Selected format
  const cardType = cardTypeSelect.value; // Selected card type

  try {
    // Construct the base query
    let query = `legalities.${format}:legal AND supertype:${cardType}`;

    // Add card name filter if provided
    if (pokemonName) {
      query += ` AND name:"${pokemonName}"`;
    }

    console.log("Search Query:", query); // Debugging: Log the query being sent to the API

    // Fetch data from API
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${query}`,
      {
        headers: { "X-Api-Key": apiKey },
      }
    );
    const data = await response.json();

    const cards = data.data;
    resultsCount.textContent = `(${cards.length})`;

    // Handle no results
    if (cards.length === 0) {
      resultsGrid.innerHTML =
        "<p>No cards match your search criteria in the selected format and type.</p>";
      return;
    }

    // Display results
    cards.forEach((card) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.id = card.id;
      cardDiv.dataset.type = card.supertype.toLowerCase();
      cardDiv.dataset.rarity = card.rarity
        ? card.rarity.toLowerCase()
        : "unknown"; // Add rarity to the search result card

      // Ensure card image is displayed correctly
      const imageUrl = card.images?.small || ""; // Use a fallback empty string if image URL is missing

      cardDiv.innerHTML = `
        <div class="card-image-container">
          <img src="${imageUrl}" alt="${
        card.name
      }" onclick="displayCardOverlay('${card.id}', '${
        card.images?.large || imageUrl
      }')">
        </div>
        <p><strong>${card.name}</strong></p>
        <li><strong>Rarity:</strong> ${card.rarity || "Unknown"}</li>
        <div class="button-container">
          <button class="add-button" onclick="addToDeck('${card.id}', '${
        card.name
      }', '${imageUrl}', '${card.supertype}', '${
        card.rarity
      }')">Add to Deck</button>
          <button class="add-button" onclick="displayCardOverlay('${
            card.id
          }', '${card.images?.large || imageUrl}')">More Info</button>
        </div>
      `;
      resultsGrid.appendChild(cardDiv);
    });
  } catch (error) {
    console.error("Error fetching card data:", error);
    resultsGrid.innerHTML = "<p>Failed to fetch cards. Please try again.</p>";
  }
});

//Expand Image on Click
async function displayCardOverlay(cardId, imageUrl) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  const cardContainer = document.createElement("div");
  cardContainer.className = "expanded-card-container";

  // Add the card image
  const expandedImage = document.createElement("img");
  expandedImage.src = imageUrl;
  expandedImage.alt = "Expanded Card";
  expandedImage.className = "expanded-image";
  cardContainer.appendChild(expandedImage);

  // Fetch and add card details
  if (cardId) {
    try {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/${cardId}`,
        { headers: { "X-Api-Key": apiKey } }
      );
      const cardData = await response.json();

      const detailsList = document.createElement("div");
      detailsList.className = "details-list";

      detailsList.innerHTML = `
            <ul>
                <li><strong>Name:</strong> ${cardData.data.name}</li>
                <li><strong>Type:</strong> ${cardData.data.supertype}</li>
                <li><strong>Set:</strong> ${cardData.data.set.name}</li>
                <li><strong>Rarity:</strong> ${cardData.data.rarity}</li>
            </ul>
            <ul>
                <li><strong>Card Number:</strong> ${cardData.data.number}</li>
                <li><strong>HP:</strong> ${cardData.data.hp || "N/A"}</li>
                <li><strong>Artist:</strong> ${cardData.data.artist}</li>
                <li><strong>Release Date:</strong> ${
                  cardData.data.set.releaseDate
                }</li>
                <li><strong>Legalities:</strong>
                    <ul>
                        <li>Standard: ${
                          cardData.data.legalities?.standard || "N/A"
                        }</li>
                        <li>Expanded: ${
                          cardData.data.legalities?.expanded || "N/A"
                        }</li>
                        <li>Unlimited: ${
                          cardData.data.legalities?.unlimited || "N/A"
                        }</li>
                    </ul>
                </li>
            </ul>
          `;

      cardContainer.appendChild(detailsList);
    } catch (error) {
      console.error("Error fetching card details:", error);
    }
  }

  // Add a rectangular Close button
  const closeButton = document.createElement("button");
  closeButton.className = "add-button"; // Reusing the same class as other buttons for styling
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  cardContainer.appendChild(closeButton);
  overlay.appendChild(cardContainer);
  document.body.appendChild(overlay);
}

// Add to Deck Functionality
function addToDeck(id, name, image, supertype, rarity) {
  // Check if the card being added is an Ace Spec card
  const isAceSpec = rarity && rarity.toLowerCase() === "ace spec rare";

  // Check for existing Ace Spec cards in the deck
  if (isAceSpec) {
    const aceSpecInDeck = Array.from(deckGrid.children).some((card) => {
      const cardRarity = card.dataset.rarity || ""; // Safely check for dataset.rarity
      return cardRarity.toLowerCase() === "ace spec rare";
    });

    if (aceSpecInDeck) {
      alert("You can only have one Ace Spec card in your deck.");
      return; // Prevent adding the new Ace Spec card
    }
  }

  const existingCard = document.querySelector(
    `#deck-grid .card[data-id="${id}"]`
  );

  if (existingCard) {
    const count = existingCard.querySelector(".count");
    const currentCount = parseInt(count.textContent);

    // Standard 4-card limit, except for Basic Energy
    const isBasicEnergy =
      supertype.toLowerCase() === "energy" &&
      name.toLowerCase().includes("basic");

    if (!isBasicEnergy && currentCount >= 4) {
      alert(`You can't add more than 4 copies of ${name} to your deck.`);
      return;
    }

    // Increment count for the card
    count.textContent = currentCount + 1;

    // Add stacked image for visual effect
    const stackedImage = document.createElement("img");
    stackedImage.src = image;
    stackedImage.alt = `${name} (Stacked)`;
    stackedImage.className = "stacked-card";
    stackedImage.style.transform = `translateY(${currentCount * 10}px)`;
    existingCard.querySelector(".card-stack").appendChild(stackedImage);
  } else {
    // Create new card entry in the deck
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.dataset.id = id;
    cardDiv.dataset.type = supertype.toLowerCase();
    cardDiv.dataset.rarity = rarity ? rarity.toLowerCase() : "unknown"; // Ensure rarity is always set

    cardDiv.innerHTML = `
      <div class="card-info">
        <p>${name} [<span class="count">1</span>]</p>
        <div class="button-container">
          <button class="add-button" onclick="displayCardOverlay('${id}', '${image}')">More Info</button>
          <button class="remove-button" onclick="removeFromDeck('${id}', '${name}')">Remove 1</button>
        </div>
      </div>  
      <div class="card-stack">
        <img src="${image}" alt="${name}" onclick="displayCardOverlay('${id}', '${image}')">
      </div>
    `;
    deckGrid.appendChild(cardDiv);
  }
}

// Remove from Deck Functionality
function removeFromDeck(id, name) {
  const existingCard = document.querySelector(
    `#deck-grid .card[data-id="${id}"]`
  );
  if (existingCard) {
    const count = existingCard.querySelector(".count");
    const currentCount = parseInt(count.textContent);

    if (currentCount > 1) {
      count.textContent = currentCount - 1;
      const cardStack = existingCard.querySelector(".card-stack");
      const stackedImages = cardStack.querySelectorAll(".stacked-card");
      if (stackedImages.length > 0) {
        cardStack.removeChild(stackedImages[stackedImages.length - 1]);
      }
    } else {
      deckGrid.removeChild(existingCard);
    }
  }
}

// Re-Order Deck Functionality
function reorderDeck() {
  const cards = Array.from(deckGrid.querySelectorAll(".card"));

  // Group by type and sort by card number
  cards.sort((a, b) => {
    const typeOrder = ["pokemon", "trainer", "energy"];
    const typeA = a.dataset.type || "unknown";
    const typeB = b.dataset.type || "unknown";

    // Sort by type
    const typeComparison = typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
    if (typeComparison !== 0) return typeComparison;

    // Sort by card number
    const cardNumberA = parseInt(a.dataset.cardNumber, 10) || 0;
    const cardNumberB = parseInt(b.dataset.cardNumber, 10) || 0;
    return cardNumberA - cardNumberB;
  });

  // Re-append cards to deckGrid in sorted order
  cards.forEach((card) => {
    deckGrid.appendChild(card);
  });
}

// Attach event listener to Re-Order button
document
  .getElementById("reorder-deck-btn")
  .addEventListener("click", reorderDeck);

// Get Card Type from Name
function getTypeFromName(name) {
  if (name.toLowerCase().includes("trainer")) return "trainer";
  if (name.toLowerCase().includes("energy")) return "energy";
  return "pokemon";
}

// Initialize Views on Load
window.onload = async () => {
  await fetchPokemonCatalog();
  await fetchTrainerCatalog();
};
