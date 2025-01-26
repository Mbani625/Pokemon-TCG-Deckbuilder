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
    const name = card.dataset.name || "Unknown Name"; // Card name from dataset
    const ptcgoCode = card.dataset.ptcgoCode || "Unknown Code";
    const cardNumber = card.dataset.cardNumber || "Unknown Number";

    // Construct card line
    const cardLine = `${count} ${name} ${ptcgoCode} ${cardNumber}`;
    const type = card.dataset.type?.toLowerCase();

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

  if (deckCards.length === 0) {
    alert("Your deck is empty. Add cards before copying.");
    return;
  }

  // Group cards by type
  const groupedCards = { Pokémon: [], Trainer: [], Energy: [] };

  deckCards.forEach((card) => {
    const count = card.querySelector(".count").textContent; // Number of copies
    const name = card.dataset.name || "Unknown Name"; // Card name from dataset
    const ptcgoCode = card.dataset.ptcgoCode || "Unknown Code";
    const cardNumber = card.dataset.cardNumber || "Unknown Number";

    // Construct card line
    const cardLine = `${count} ${name} ${ptcgoCode} ${cardNumber}`;
    const type = card.dataset.type?.toLowerCase();

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

function enableSwipeClose(overlay) {
  let startX = 0;

  overlay.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  });

  overlay.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    const diffX = touch.clientX - startX;

    if (Math.abs(diffX) > 100) {
      document.body.removeChild(overlay);
    }
  });
}
