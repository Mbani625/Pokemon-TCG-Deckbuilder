//Expand Image on Click
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

async function displayCardOverlay(cardId, imageUrl) {
  // Check if an overlay already exists
  if (document.querySelector(".overlay")) {
    return; // Prevent creating another overlay
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay";

  const cardContainer = document.createElement("div");
  cardContainer.className = "expanded-card-container";

  const expandedImage = document.createElement("img");
  expandedImage.src = imageUrl;
  expandedImage.alt = "Expanded Card";
  expandedImage.className = "expanded-image";
  cardContainer.appendChild(expandedImage);

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
        </ul>
      `;
      cardContainer.appendChild(detailsList);
    } catch (error) {
      console.error("Error fetching card details:", error);
    }
  }

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  cardContainer.appendChild(closeButton);
  overlay.appendChild(cardContainer);
  document.body.appendChild(overlay);

  enableSwipeClose(overlay);
}
