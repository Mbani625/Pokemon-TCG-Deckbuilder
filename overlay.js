async function displayCardOverlay(cardId, imageUrl) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  // Apply dark mode if enabled
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
  closeButton.className = "add-button"; // Reusing the same class as other buttons for styling
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  cardContainer.appendChild(closeButton);
  overlay.appendChild(cardContainer);
  document.body.appendChild(overlay);

  enableSwipeClose(overlay);
}

// Add Event Listeners to All Images
function attachOverlayListeners() {
  const images = document.querySelectorAll("img");
  images.forEach((image) => {
    image.addEventListener("click", (event) => {
      const cardElement = image.closest(".card, .card-stack");
      if (!cardElement) return;

      const cardId = cardElement.dataset.id || null;
      const imageUrl = image.src;

      displayCardOverlay(cardId, imageUrl);
    });
  });
}

// Call this after rendering cards
attachOverlayListeners();
