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

      console.log(`Processing Card: ${card.name}`);
      console.log(`Set ID: ${setId}, PTCGO Code: ${ptcgoCode}`); // Debug

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
          <button class="add-button" onclick="addToDeck('${card.id}', '${
        card.name
      }', '${card.images?.small || ""}', '${card.supertype}', '${
        card.rarity
      }', '${setId}', '${card.number}', '${ptcgoCode}')">Add to Deck</button>
          <button class="add-button" onclick="displayCardOverlay('${
            card.id
          }', '${card.images?.large || ""}')">More Info</button>
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
// Add to Deck Functionality
function addToDeck(
  id,
  name,
  image,
  supertype,
  rarity,
  setId,
  cardNumber,
  ptcgoCode
) {
  // Debugging: Ensure the PTCGO Code is passed correctly
  console.log("Adding to Deck:", { id, name, supertype, ptcgoCode });

  // Check if the card is an Ace Spec card
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

  // Check total copies of the card with the same name in the deck
  const totalCopiesWithName = Array.from(deckGrid.children).reduce(
    (count, card) => {
      const cardName = card
        .querySelector(".card-info p")
        ?.textContent.split(" [")[0]
        .trim(); // Extract the card name
      return cardName?.toLowerCase() === name.toLowerCase()
        ? count + parseInt(card.querySelector(".count").textContent)
        : count;
    },
    0
  );

  if (totalCopiesWithName >= 4) {
    alert(`You cannot have more than 4 copies of "${name}" in your deck.`);
    return; // Prevent adding more copies
  }

  // Check if the card is Basic Energy
  const isBasicEnergy =
    supertype.toLowerCase() === "energy" &&
    name.toLowerCase().includes("basic");

  if (isBasicEnergy) {
    // Allow unlimited copies of Basic Energy cards
    const existingCard = document.querySelector(
      `#deck-grid .card[data-id="${id}"]`
    );
    if (existingCard) {
      const count = existingCard.querySelector(".count");
      const currentCount = parseInt(count.textContent);

      // Increment count for the Basic Energy card
      count.textContent = currentCount + 1;

      // Add stacked image for visual effect
      const stackedImage = document.createElement("img");
      stackedImage.src = image;
      stackedImage.alt = `${name} (Stacked)`;
      stackedImage.className = "stacked-card";
      stackedImage.style.transform = `translateY(${currentCount * 10}px)`;
      existingCard.querySelector(".card-stack").appendChild(stackedImage);
    } else {
      // Create new Basic Energy card entry in the deck
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.id = id;
      cardDiv.dataset.type = supertype.toLowerCase();
      cardDiv.dataset.rarity = rarity ? rarity.toLowerCase() : "unknown"; // Ensure rarity is always set
      cardDiv.dataset.setId = setId || "Unknown Set"; // Include set ID
      cardDiv.dataset.ptcgoCode = ptcgoCode || "Unknown Code"; // Add PTCGO Code
      cardDiv.dataset.cardNumber = cardNumber || "Unknown Number"; // Include card number

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
    return; // Skip the remaining checks for Basic Energy
  }

  // For non-Basic Energy cards, enforce the 4-card limit
  const existingCard = document.querySelector(
    `#deck-grid .card[data-id="${id}"]`
  );

  if (existingCard) {
    const count = existingCard.querySelector(".count");
    const currentCount = parseInt(count.textContent);

    if (currentCount >= 4) {
      alert(`You cannot have more than 4 copies of "${name}" in your deck.`);
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
    cardDiv.dataset.setId = setId || "Unknown Set"; // Include set ID
    cardDiv.dataset.ptcgoCode = ptcgoCode || "Unknown Code"; // Add PTCGO Code
    cardDiv.dataset.cardNumber = cardNumber || "Unknown Number"; // Include card number

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

document.getElementById("export-text").addEventListener("click", () => {
  const deckGrid = document.getElementById("deck-grid");
  const deckCards = Array.from(deckGrid.children);

  if (deckCards.length === 0) {
    alert("Your deck is empty. Add cards before exporting.");
    return;
  }

  // Group cards by type
  const groupedCards = { Pokémon: [], Trainer: [], Energy: [] };

  deckCards.forEach((card) => {
    const count = card.querySelector(".count").textContent; // Number of copies
    const name = card
      .querySelector(".card-info p")
      .textContent.split(" [")[0]
      .trim(); // Card name
    const ptcgoCode = card.dataset.ptcgoCode || "Unknown Code";
    let cardNumber = card.dataset.cardNumber || "Unknown Number";

    // Extract numeric portion of cardNumber
    const numericCardNumber = cardNumber.replace(/\D/g, ""); // Remove all non-numeric characters

    const cardLine = `${count} ${name} ${ptcgoCode} ${numericCardNumber}`;
    const type = card.dataset.type.toLowerCase();

    if (type === "pokémon") groupedCards.Pokémon.push(cardLine);
    else if (type === "trainer") groupedCards.Trainer.push(cardLine);
    else if (type === "energy") groupedCards.Energy.push(cardLine);
  });

  // Format the decklist
  let deckString = "";
  let totalCards = 0;

  Object.entries(groupedCards).forEach(([group, cards]) => {
    if (cards.length > 0) {
      deckString += `${group}: ${cards.length}\n`; // Add header with count
      deckString += cards.join("\n") + "\n\n"; // Add card details
      totalCards += cards.reduce(
        (sum, line) => sum + parseInt(line.split(" ")[0]),
        0
      ); // Sum card counts
    }
  });

  deckString += `Total Cards: ${totalCards}`;

  // Create and download the text file
  const blob = new Blob([deckString], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "decklist.txt";
  link.click();
});

document.getElementById("copy-decklist").addEventListener("click", () => {
  const deckGrid = document.getElementById("deck-grid");
  const deckCards = Array.from(deckGrid.children);

  // Construct the decklist as text
  const deckText = deckCards.map((card) => {
    const count = card.querySelector(".count").textContent; // Number of copies
    const name = card
      .querySelector(".card-info p")
      .textContent.split(" [")[0]
      .trim(); // Card name
    const setId = card.dataset.setId || "Unknown Set"; // Set ID
    const cardNumber = card.dataset.cardNumber || "Unknown Number"; // Card number

    return `${count} ${name} ${setId} ${cardNumber}`;
  });

  // If the deck is empty, show an alert
  if (deckText.length === 0) {
    alert("Your deck is empty. Add cards before copying.");
    return;
  }

  // Copy the decklist to the clipboard
  document.getElementById("copy-decklist").addEventListener("click", () => {
    const deckGrid = document.getElementById("deck-grid");
    const deckCards = Array.from(deckGrid.children);

    if (deckCards.length === 0) {
      alert("Your deck is empty. Add cards before copying.");
      return;
    }

    // Group cards by type
    const groupedCards = { Pokémon: [], Trainer: [], Energy: [] };

    deckCards.forEach((card) => {
      const count = card.querySelector(".count").textContent; // Number of copies
      const name = card
        .querySelector(".card-info p")
        .textContent.split(" [")[0]
        .trim();
      const ptcgoCode = card.dataset.ptcgoCode || "Unknown Code";
      let cardNumber = card.dataset.cardNumber || "Unknown Number";

      // Extract numeric portion of cardNumber
      const numericCardNumber = cardNumber.replace(/\D/g, ""); // Remove all non-numeric characters

      const cardLine = `${count} ${name} ${ptcgoCode} ${numericCardNumber}`;
      const type = card.dataset.type.toLowerCase();

      if (type === "pokémon") groupedCards.Pokémon.push(cardLine);
      else if (type === "trainer") groupedCards.Trainer.push(cardLine);
      else if (type === "energy") groupedCards.Energy.push(cardLine);
    });

    // Format decklist with headers and grouped cards
    let deckString = "";
    let totalCards = 0;

    Object.entries(groupedCards).forEach(([group, cards]) => {
      if (cards.length > 0) {
        deckString += `${group}: ${cards.length}\n`; // Add header with count
        deckString += cards.join("\n") + "\n\n"; // Add card details
        totalCards += cards.reduce(
          (sum, line) => sum + parseInt(line.split(" ")[0]),
          0
        ); // Sum card counts
      }
    });

    deckString += `Total Cards: ${totalCards}`;

    // Copy formatted decklist to clipboard
    navigator.clipboard
      .writeText(deckString)
      .then(() => {
        alert("Decklist copied to clipboard in Pokémon TCG Live format!");
      })
      .catch((err) => {
        console.error("Failed to copy decklist: ", err);
        alert("Failed to copy decklist. Please try again.");
      });
  });
});

document.getElementById("clear-decklist").addEventListener("click", () => {
  const deckGrid = document.getElementById("deck-grid");

  // Confirm before clearing the deck
  if (
    confirm(
      "Are you sure you want to clear your decklist? This action cannot be undone."
    )
  ) {
    // Remove all cards from the deck
    deckGrid.innerHTML = "";
    alert("Your decklist has been cleared.");
  }
});

// Initialize Views on Load
window.onload = async () => {
  await fetchPokemonCatalog();
  await fetchTrainerCatalog();
};
