const apiKey = "YOUR_API_KEY"; // Replace with your Pokémon TCG API key
const resultsGrid = document.getElementById("results-grid");
const deckGrid = document.getElementById("deck-grid");
const searchButton = document.getElementById("search-button");
const cardNameInput = document.getElementById("card-name");
const cardSetSelect = document.getElementById("card-set");
const cardTypeSelect = document.getElementById("card-type");
const cardDetailSelect = document.getElementById("card-detail");
const autocompleteResults = document.getElementById("autocomplete-results");
const notificationArea = document.getElementById("notification-area");

// Load card sets on page load
window.onload = async () => {
  const response = await fetch("https://api.pokemontcg.io/v2/sets", {
    headers: { "X-Api-Key": apiKey },
  });
  const data = await response.json();
  data.data.forEach((set) => {
    const option = document.createElement("option");
    option.value = set.id;
    option.textContent = set.name;
    cardSetSelect.appendChild(option);
  });
};

// Update card detail dropdown based on card type
cardTypeSelect.addEventListener("change", () => {
  const type = cardTypeSelect.value;
  cardDetailSelect.innerHTML = '<option value="">All</option>'; // Reset

  if (type === "pokemon") {
    [
      "Electric",
      "Fighting",
      "Colorless",
      "Fire",
      "Water",
      "Psychic",
      "Grass",
      "Darkness",
      "Metal",
      "Dragon",
      "Fairy",
    ].forEach((pokemonType) => {
      const option = document.createElement("option");
      option.value = pokemonType.toLowerCase();
      option.textContent = pokemonType;
      cardDetailSelect.appendChild(option);
    });
  } else if (type === "trainer") {
    ["Item", "Supporter", "Tool", "Stadium"].forEach((trainerType) => {
      const option = document.createElement("option");
      option.value = trainerType.toLowerCase();
      option.textContent = trainerType;
      cardDetailSelect.appendChild(option);
    });
  } else if (type === "energy") {
    ["Basic", "Special"].forEach((energyType) => {
      const option = document.createElement("option");
      option.value = energyType.toLowerCase();
      option.textContent = energyType;
      cardDetailSelect.appendChild(option);
    });
  }
});

// Autocomplete for card names
cardNameInput.addEventListener("input", async () => {
  const query = cardNameInput.value.trim();
  autocompleteResults.innerHTML = ""; // Clear previous results

  if (query.length < 2) {
    autocompleteResults.style.display = "none";
    return;
  }

  const response = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=name:${query}*`,
    {
      headers: { "X-Api-Key": apiKey },
    }
  );
  const data = await response.json();

  if (data.data.length > 0) {
    autocompleteResults.style.display = "block";
    data.data.slice(0, 10).forEach((card) => {
      const div = document.createElement("div");
      div.textContent = card.name;
      div.className = "autocomplete-item";
      div.addEventListener("click", () => {
        cardNameInput.value = card.name;
        autocompleteResults.innerHTML = "";
        autocompleteResults.style.display = "none";
      });
      autocompleteResults.appendChild(div);
    });
  } else {
    const noResultsDiv = document.createElement("div");
    noResultsDiv.textContent = "No matching cards found.";
    noResultsDiv.className = "autocomplete-item";
    autocompleteResults.appendChild(noResultsDiv);
    autocompleteResults.style.display = "block";
  }
});

// Position autocomplete dropdown correctly
cardNameInput.addEventListener("focus", () => {
  const rect = cardNameInput.getBoundingClientRect();
  autocompleteResults.style.top = `${rect.bottom + window.scrollY}px`;
  autocompleteResults.style.left = `${rect.left + window.scrollX}px`;
  autocompleteResults.style.width = `${rect.width}px`;
});

// Hide autocomplete when clicking outside
document.addEventListener("click", (e) => {
  if (
    !cardNameInput.contains(e.target) &&
    !autocompleteResults.contains(e.target)
  ) {
    autocompleteResults.style.display = "none";
  }
});

// Search for cards
searchButton.addEventListener("click", async () => {
  const query = [];
  if (cardNameInput.value) query.push(`name:${cardNameInput.value}`);
  if (cardSetSelect.value) query.push(`set.id:${cardSetSelect.value}`);
  if (cardTypeSelect.value) query.push(`supertype:${cardTypeSelect.value}`);
  if (cardDetailSelect.value) {
    if (cardTypeSelect.value === "pokemon") {
      query.push(`types:${cardDetailSelect.value}`);
    } else if (cardTypeSelect.value === "trainer") {
      query.push(`subtypes:${cardDetailSelect.value}`);
    } else if (cardTypeSelect.value === "energy") {
      query.push(`subtypes:${cardDetailSelect.value}`);
    }
  }

  const response = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=${query.join(" ")}`,
    {
      headers: { "X-Api-Key": apiKey },
    }
  );
  const data = await response.json();

  if (data.data.length === 0) {
    showNotification("No cards found matching the criteria.", "error");
  } else {
    hideNotification();
    displaySearchResults(data.data);
  }
});

// Show notification
function showNotification(message, type) {
  notificationArea.innerHTML = `<div class="notification ${type}">${message}</div>`;
}

// Hide notification
function hideNotification() {
  notificationArea.innerHTML = "";
}

// Display search results
function displaySearchResults(cards) {
  resultsGrid.innerHTML = "";
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `
            <img src="${card.images.small}" alt="${card.name}">
            <p>${card.name}</p>
            <button onclick="addToDeck('${card.id}', '${card.name}', '${card.images.small}')">Add to Deck</button>
        `;
    resultsGrid.appendChild(cardDiv);
  });
}

// Add card to deck
function addToDeck(id, name, image) {
  const existingCard = document.querySelector(
    `#deck-grid .card[data-id="${id}"]`
  );
  if (existingCard) {
    const count = existingCard.querySelector(".count");
    if (parseInt(count.textContent) < 4) {
      count.textContent = parseInt(count.textContent) + 1;
    }
  } else {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.dataset.id = id;
    cardDiv.innerHTML = `
            <img src="${image}" alt="${name}">
            <p>${name}</p>
            <p>Count: <span class="count">1</span></p>
        `;
    deckGrid.appendChild(cardDiv);
  }
}
