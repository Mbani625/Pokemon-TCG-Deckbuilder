// Save a deck to localStorage
function saveDeck(deckName, cards) {
  const savedDecks = JSON.parse(localStorage.getItem("savedDecks")) || {};
  savedDecks[deckName] = cards;
  localStorage.setItem("savedDecks", JSON.stringify(savedDecks));
  alert(`Deck "${deckName}" has been saved.`);
}

// Load a specific deck by name
function loadDeck(deckName) {
  const savedDecks = JSON.parse(localStorage.getItem("savedDecks")) || {};
  return savedDecks[deckName] || null;
}

// Get all saved decks
function getAllDecks() {
  return JSON.parse(localStorage.getItem("savedDecks")) || {};
}

async function loadCurrentDeckToGrid(deckGrid) {
  const currentDeck = JSON.parse(localStorage.getItem("deckList")); // Retrieve the deck
  if (!currentDeck) {
    console.warn("No deck loaded from localStorage.");
    return;
  }

  deckGrid.innerHTML = ""; // Clear the grid

  for (const card of currentDeck) {
    if (!card.id || !card.image || card.count == null) {
      console.warn("Incomplete card data:", card);
      continue;
    }

    try {
      // Fetch card details from the API for additional data
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/${card.id}`,
        {
          headers: { "X-Api-Key": "YOUR_API_KEY" }, // Replace with your actual API key
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch card data for ID: ${card.id}`);
      }

      const cardData = await response.json();
      const cardDetails = cardData.data;

      // Create the card container
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.id = card.id;
      cardDiv.dataset.name = cardDetails.name;
      cardDiv.dataset.type = cardDetails.supertype?.toLowerCase() || "unknown";
      cardDiv.dataset.rarity = cardDetails.rarity?.toLowerCase() || "unknown";
      cardDiv.dataset.setId = cardDetails.set?.id || "Unknown Set";
      cardDiv.dataset.ptcgoCode = cardDetails.set?.ptcgoCode || "Unknown Code";
      cardDiv.dataset.cardNumber = cardDetails.number || "Unknown Number";

      const cardStack = document.createElement("div");
      cardStack.className = "card-stack";

      for (let i = 0; i < card.count; i++) {
        const stackedImage = document.createElement("img");
        stackedImage.src = card.image;
        stackedImage.alt = `${cardDetails.name} (Stacked)`;
        stackedImage.className = "stacked-card";
        stackedImage.style.transform = `translateY(${i * 10}px)`;
        stackedImage.onclick = () => displayCardOverlay(card.id, card.image); // Attach overlay function
        cardStack.appendChild(stackedImage);
      }

      // Add card info with buttons
      const cardInfo = document.createElement("div");
      cardInfo.className = "card-info";
      cardInfo.innerHTML = `
        <p>x <span class="count">${card.count}</span></p>
          <button class="add-button" onclick="addToDeck('${
            card.id
          }', '${cardDetails.name.replace(/'/g, "\\'")}', '${card.image}', '${
        cardDetails.supertype
      }', '${cardDetails.rarity}', '${cardDetails.set?.id}', '${
        cardDetails.number
      }', '${cardDetails.set?.ptcgoCode}')">+1</button>
          <button class="remove-button" onclick="removeFromDeck('${
            card.id
          }')">-1</button>
        
      `;

      // Append elements to the card container
      cardDiv.appendChild(cardInfo);
      cardDiv.appendChild(cardStack);

      // Add the card container to the deck grid
      deckGrid.appendChild(cardDiv);
    } catch (error) {
      console.error(`Error loading card data for ID: ${card.id}`, error);
    }
  }
}

// Export functions to global scope if not using modules
window.saveDeck = saveDeck;
window.loadDeck = loadDeck;
window.getAllDecks = function getAllDecks() {
  return JSON.parse(localStorage.getItem("savedDecks")) || {};
};

window.loadCurrentDeckToGrid = loadCurrentDeckToGrid;
