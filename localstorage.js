// Save the deck to localStorage
function saveDeckToLocalStorage() {
  const cards = Array.from(deckGrid.children).map((card) => ({
    id: card.dataset.id,
    name: card.querySelector(".card-info p").textContent.split(" [")[0].trim(),
    count: parseInt(card.querySelector(".count").textContent),
    image: card.querySelector("img").src,
    supertype: card.dataset.type,
    rarity: card.dataset.rarity,
    setId: card.dataset.setId,
    cardNumber: card.dataset.cardNumber,
    ptcgoCode: card.dataset.ptcgoCode,
  }));

  localStorage.setItem("deckList", JSON.stringify(cards));
  console.log("Deck saved to localStorage.");
}

// Load the deck from localStorage
function loadDeckFromLocalStorage() {
  const storedDeck = JSON.parse(localStorage.getItem("deckList"));
  if (storedDeck) {
    const deckGrid = document.getElementById("deck-grid");
    deckGrid.innerHTML = ""; // Clear the current deck

    storedDeck.forEach((card) => {
      // Create the card element
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.id = card.id;
      cardDiv.dataset.type = card.supertype.toLowerCase();
      cardDiv.dataset.rarity = card.rarity;
      cardDiv.dataset.setId = card.setId;
      cardDiv.dataset.ptcgoCode = card.ptcgoCode;
      cardDiv.dataset.cardNumber = card.cardNumber;

      cardDiv.innerHTML = `
        <div class="card-info">
          <p>${card.name} [<span class="count">${card.count}</span>]</p>
          <div class="button-container">
            <button class="remove-button" onclick="removeFromDeck('${card.id}', '${card.name}')">Remove 1</button>
          </div>
        </div>
        <div class="card-stack">
          <img src="${card.image}" alt="${card.name}">
        </div>
      `;

      const cardStackContainer = cardDiv.querySelector(".card-stack");

      // Add stacked images if the card count is greater than 1
      const cardCount = parseInt(card.count, 10);
      for (let i = 1; i < cardCount; i++) {
        const stackedImage = document.createElement("img");
        stackedImage.src = card.image;
        stackedImage.alt = `${card.name} (Stacked)`;
        stackedImage.className = "stacked-card";
        stackedImage.style.transform = `translateY(${i * 10}px)`;
        cardStackContainer.appendChild(stackedImage);
      }

      // Add event listener to the main image for showing details
      const mainImage = cardDiv.querySelector(".card-stack img");
      mainImage.addEventListener("click", () => {
        displayCardOverlay({
          id: card.id,
          image: card.image,
          name: card.name,
        });
      });

      deckGrid.appendChild(cardDiv);
    });

    console.log("Deck loaded from localStorage.");
  }
}

// Clear the stored deck
function clearDeckFromLocalStorage() {
  localStorage.removeItem("deckList");
  deckGrid.innerHTML = ""; // Clear the UI deck
  console.log("Deck cleared from localStorage.");
}

// Attach event listener to the clear-decklist button
document.addEventListener("DOMContentLoaded", () => {
  // Load the deck from localStorage on page load
  loadDeckFromLocalStorage();

  // Attach clear button functionality
  const clearDeckButton = document.getElementById("clear-decklist");
  if (clearDeckButton) {
    clearDeckButton.addEventListener("click", () => {
      clearDeckFromLocalStorage();
      alert("Deck list cleared!");
    });
  }
});

// Use MutationObserver to detect changes to the deck grid
const observer = new MutationObserver(() => {
  saveDeckToLocalStorage();
});

// Start observing the deckGrid for child list changes
observer.observe(deckGrid, { childList: true, subtree: true });
