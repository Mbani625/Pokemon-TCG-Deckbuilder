function initializeApp() {
  const toggleButton = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Ensure darkMode is initialized in localStorage
  if (!localStorage.getItem("darkMode")) {
    localStorage.setItem("darkMode", "disabled");
  }

  // Apply the stored preference
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggleButton.classList.add("dark-mode");
    toggleButton.textContent = "☀️ Light Mode";
  }

  // Add toggle functionality
  toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    toggleButton.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      toggleButton.textContent = "☀️ Light Mode";
    } else {
      localStorage.setItem("darkMode", "disabled");
      toggleButton.textContent = "🌙 Dark Mode";
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeApp);

let lastTouchTime = 0;

document.addEventListener("touchstart", (event) => {
  const now = Date.now();

  if (now - lastTouchTime <= 300) {
    event.preventDefault(); // Prevent default behavior for double-tap
  }

  lastTouchTime = now;
});

// Add event listener to the "See Deck" button
document.getElementById("see-deck-button").addEventListener("click", () => {
  window.location.href = "fulldeck.html"; // Navigate to the full deck page
});

const backToTopButton = document.getElementById("back-to-top");

// Smooth scroll to the top of the page
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Smooth scroll to the "Your Deck" section
function scrollToDeck() {
  const deckSection = document.getElementById("deck-section"); // Replace with your actual section ID
  if (deckSection) {
    deckSection.scrollIntoView({ behavior: "smooth" });
  } else {
    console.warn("Deck section not found!");
  }
}

// Attach event listeners to buttons
document.getElementById("go-to-top-button").addEventListener("click", scrollToTop);
document.getElementById("go-to-deck-button").addEventListener("click", scrollToDeck);

