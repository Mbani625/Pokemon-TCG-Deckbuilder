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
