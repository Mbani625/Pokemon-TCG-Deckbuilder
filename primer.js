document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const deckName = params.get("deckName");

  const deckTitle = document.getElementById("deck-title");
  const markdownEditor = document.getElementById("markdown-editor");
  const saveButton = document.getElementById("save-primer");
  const viewButton = document.getElementById("view-primer");
  const backButton = document.getElementById("back-to-decks");

  const modal = document.getElementById("primer-preview-modal");
  const modalContent = document.getElementById("markdown-preview");
  const closeModalButton = document.getElementById("close-modal");

  // Confirm marked.js is loaded
  console.log("Marked.js loaded:", typeof marked.parse === "function");

  // Set the title
  deckTitle.textContent = `Primer for ${deckName}`;

  // Load existing primer content
  const savedPrimer = localStorage.getItem(`primer_${deckName}`);
  if (savedPrimer) {
    markdownEditor.value = savedPrimer;
  }

  // Save primer content
  saveButton.addEventListener("click", () => {
    const primerContent = markdownEditor.value;
    localStorage.setItem(`primer_${deckName}`, primerContent);
    alert("Primer saved successfully!");
  });

  // View primer in modal
  viewButton.addEventListener("click", () => {
    const primerContent = markdownEditor.value;
    modalContent.innerHTML = marked.parse(primerContent); // Use `marked.parse` to convert markdown
    modal.classList.remove("hidden"); // Show modal
  });

  // Close modal
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Close modal on outside click
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Navigate back to My Decks
  backButton.addEventListener("click", () => {
    window.location.href = "decks.html"; // Adjust the filename as needed
  });
});
