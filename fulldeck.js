document.addEventListener("DOMContentLoaded", () => {
  const deckGrid = document.getElementById("full-deck-grid");
  const currentDeck = JSON.parse(localStorage.getItem("deckList"));

  if (!currentDeck || currentDeck.length === 0) {
    fullDeckGrid.innerHTML = "<p>Your deck is empty.</p>";
    return;
  }

  currentDeck.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "fulldeck-card";

    // Create the card stack
    const cardStack = document.createElement("div");
    cardStack.className = "fulldeck-stacked-card";

    for (let i = 0; i < card.count; i++) {
      const stackedImage = document.createElement("img");
      stackedImage.src = card.image;
      stackedImage.alt = `${card.name} (Stacked)`;
      stackedImage.style.transform = `translateY(${i * 10}px)`; // Offset for stacking
      cardStack.appendChild(stackedImage);
    }

    const cardName = document.createElement("p");
    cardName.textContent = card.name;

    cardDiv.appendChild(cardStack);
    cardDiv.appendChild(cardName);
    deckGrid.appendChild(cardDiv);
  });
});

// Add event listener for "Return to Main" button
document.getElementById("return-to-main").addEventListener("click", () => {
  window.location.href = "index.html"; // Replace with your index page filename if different
});
