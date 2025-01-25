// Save the current deck under a specific folder and name
function saveDeckToFolder(deckName, folderName) {
  const deckGrid = document.getElementById("deck-grid");
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

  const savedDecks = JSON.parse(localStorage.getItem(folderName)) || {};
  savedDecks[deckName] = cards;

  localStorage.setItem(folderName, JSON.stringify(savedDecks));
  alert(`Deck saved as "${deckName}" in folder "${folderName}".`);
}

// Create a new folder
function createFolder(folderName) {
  const folders = JSON.parse(localStorage.getItem("deckFolders")) || [];
  if (!folders.includes(folderName)) {
    folders.push(folderName);
    localStorage.setItem("deckFolders", JSON.stringify(folders));
    alert(`Folder "${folderName}" created.`);
  } else {
    alert("Folder already exists.");
  }
}

// Load deck folders
function loadDeckFolders() {
  const folders = JSON.parse(localStorage.getItem("deckFolders")) || [];
  return folders;
}

// Load a specific deck from a folder
function loadDeckFromFolder(folderName, deckName) {
  const folderDecks = JSON.parse(localStorage.getItem(folderName)) || {};
  const deck = folderDecks[deckName];
  if (deck) {
    localStorage.setItem("deckList", JSON.stringify(deck));
    alert(`Deck "${deckName}" loaded from folder "${folderName}".`);
    window.location.href = "index.html";
  } else {
    alert("Deck not found in the selected folder.");
  }
}

// Load deck from localStorage
function loadDeckFromLocalStorage() {
  const storedDeck = JSON.parse(localStorage.getItem("deckList"));
  if (storedDeck) {
    const deckGrid = document.getElementById("deck-grid");
    deckGrid.innerHTML = "";
    storedDeck.forEach((card) => {
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
            <button class="add-button" onclick="displayCardOverlay('${card.id}', '${card.image}')">More Info</button>
            <button class="remove-button" onclick="removeFromDeck('${card.id}', '${card.name}')">Remove 1</button>
          </div>
        </div>
        <div class="card-stack">
          <img src="${card.image}" alt="${card.name}">
        </div>
      `;

      const cardStackContainer = cardDiv.querySelector(".card-stack");
      const cardCount = parseInt(card.count, 10);
      for (let i = 1; i < cardCount; i++) {
        const stackedImage = document.createElement("img");
        stackedImage.src = card.image;
        stackedImage.alt = `${card.name} (Stacked)`;
        stackedImage.className = "stacked-card";
        stackedImage.style.transform = `translateY(${i * 10}px)`;
        cardStackContainer.appendChild(stackedImage);
      }

      deckGrid.appendChild(cardDiv);
    });
    console.log("Deck loaded from localStorage.");
  }
}

// Load the current deck from localStorage to the grid
function loadCurrentDeck() {
  const storedDeck = JSON.parse(localStorage.getItem("deckList"));
  if (storedDeck) {
    const deckGrid = document.getElementById("deck-grid");
    deckGrid.innerHTML = "";
    storedDeck.forEach((card) => {
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
            <button class="add-button" onclick="displayCardOverlay('${card.id}', '${card.image}')">More Info</button>
            <button class="remove-button" onclick="removeFromDeck('${card.id}', '${card.name}')">Remove 1</button>
          </div>
        </div>
        <div class="card-stack">
          <img src="${card.image}" alt="${card.name}">
        </div>
      `;

      const cardStackContainer = cardDiv.querySelector(".card-stack");
      const cardCount = parseInt(card.count, 10);
      for (let i = 1; i < cardCount; i++) {
        const stackedImage = document.createElement("img");
        stackedImage.src = card.image;
        stackedImage.alt = `${card.name} (Stacked)`;
        stackedImage.className = "stacked-card";
        stackedImage.style.transform = `translateY(${i * 10}px)`;
        cardStackContainer.appendChild(stackedImage);
      }

      deckGrid.appendChild(cardDiv);
    });
    console.log("Deck loaded from localStorage.");
  }
}

// Export the functions to global scope if modules are not used
window.saveDeckToFolder = saveDeckToFolder;
window.createFolder = createFolder;
window.loadDeckFolders = loadDeckFolders;
window.loadDeckFromFolder = loadDeckFromFolder;
window.loadCurrentDeck = loadCurrentDeck;
