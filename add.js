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
      // Safely check for the card info and count elements
      const cardNameElement = card.querySelector(".card-info p");
      const countElement = card.querySelector(".count");

      if (!cardNameElement || !countElement) {
        console.warn("Card info or count element is missing for a card:", card);
        return count; // Skip this iteration if either element is missing
      }

      const cardName = cardNameElement.textContent.split(" [")[0].trim();
      const cardCount = parseInt(countElement.textContent);

      return cardName.toLowerCase() === name.toLowerCase()
        ? count + cardCount
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
