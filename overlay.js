async function displayCardOverlay(cardId, imageUrl) {
  // Apply dark mode if enabled
  if (document.body.classList.contains("dark-mode")) {
    overlay.classList.add("dark-mode");
  }

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
  // Create a container for navigation arrows
  const navContainer = document.createElement("div");
  navContainer.className = "nav-container";

  const leftArrow = document.createElement("button");
  leftArrow.className = "nav-arrow left-arrow";
  leftArrow.textContent = "◀";
  navContainer.appendChild(leftArrow);

  const rightArrow = document.createElement("button");
  rightArrow.className = "nav-arrow right-arrow";
  rightArrow.textContent = "▶";
  navContainer.appendChild(rightArrow);

  // Append navigation container to the card container
  cardContainer.appendChild(navContainer);
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

      // Handle navigation logic
      const cards = Array.from(
        document.querySelectorAll("#results-grid .card")
      );
      let currentIndex = cards.findIndex((card) => card.dataset.id === cardId);

      function navigate(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = cards.length - 1;
        if (currentIndex >= cards.length) currentIndex = 0;

        const nextCard = cards[currentIndex];
        const nextCardId = nextCard.dataset.id;
        const nextImageUrl = nextCard.querySelector("img").src;

        // Update overlay content
        expandedImage.src = nextImageUrl;
        expandedImage.alt = "Expanded Card";
        displayCardOverlay(nextCardId, nextImageUrl); // Refresh overlay
      }

      leftArrow.addEventListener("click", () => navigate(-1));
      rightArrow.addEventListener("click", () => navigate(1));

      // Handle swipe gestures
      let startX = 0;

      overlay.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
      });

      overlay.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (diff > 50) navigate(1); // Swipe left
        if (diff < -50) navigate(-1); // Swipe right
      });
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
    const handleEvent = (event) => {
      event.preventDefault(); // Prevent default touch/click behavior
      const cardElement = image.closest(".card, .card-stack");
      if (!cardElement) return;

      const cardId = cardElement.dataset.id || null;
      const imageUrl = image.src;

      displayCardOverlay(cardId, imageUrl);
    };

    // Add listeners for both click and touchstart
    image.addEventListener("click", handleEvent);
    image.addEventListener("touchstart", handleEvent);
  });
}

// Call this after rendering cards
document.addEventListener("DOMContentLoaded", () => {
  attachOverlayListeners();
});
