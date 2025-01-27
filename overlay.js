// Display the card overlay without navigation logic
async function displayCardOverlay(cardId, imageUrl, context = "search") {
  // Remove any existing overlay
  const existingOverlay = document.querySelector(".overlay");
  if (existingOverlay) {
    document.body.removeChild(existingOverlay);
  }

  // Create a new overlay
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  if (document.body.classList.contains("dark-mode")) {
    overlay.classList.add("dark-mode");
  }

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
                <li><strong>Evolves From:</strong> ${
                  cardData.data.evolvesFrom || "N/A"
                }</li>
                <li><strong>Evolves Into:</strong> ${
                  cardData.data.evolvesTo?.join(", ") || "N/A"
                }</li>
            </ul>
            <ul>
                <li><strong>Card Number:</strong> ${cardData.data.number}</li>
                <li><strong>HP:</strong> ${cardData.data.hp || "N/A"}</li>
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
          `;

      cardContainer.appendChild(detailsList);

      // Add a "Show Evolutions" button if evolution data is available
      if (cardData.data.evolvesFrom || cardData.data.evolvesTo) {
        const showEvolutionsButton = document.createElement("button");
        showEvolutionsButton.className = "add-button";
        showEvolutionsButton.textContent = "Show Evolutions";
        showEvolutionsButton.onclick = () =>
          showEvolutions(cardId, cardData.data.name);
        cardContainer.appendChild(showEvolutionsButton);
      }
    } catch (error) {
      console.error("Error fetching card details:", error);
    }
  }

  // Add a rectangular Close button
  const closeButton = document.createElement("button");
  closeButton.className = "add-button";
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  cardContainer.appendChild(closeButton);
  overlay.appendChild(cardContainer);
  document.body.appendChild(overlay);
}

// Add Event Listeners to All Images
function attachOverlayListeners() {
  const searchCards = document.querySelectorAll("#results-grid .card");
  const deckCards = document.querySelectorAll("#deck-grid .card");

  searchCards.forEach((card) => {
    card.querySelector("img").addEventListener("click", () =>
      displayCardOverlay(card.dataset.id, card.querySelector("img").src, "search")
    );
  });

  deckCards.forEach((card) => {
    card.querySelector("img").addEventListener("click", () =>
      displayCardOverlay(card.dataset.id, card.querySelector("img").src, "deck")
    );
  });
}

// Ensure correct context is maintained after rendering cards
document.addEventListener("DOMContentLoaded", () => {
  attachOverlayListeners();
});

