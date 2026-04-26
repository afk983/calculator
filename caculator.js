// DOM Elements
const display = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");
const themeBtn = document.getElementById("themeBtn");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const premiumModal = document.getElementById("premiumModal");
const closeModalBtn = document.getElementById("closeModal");
const upgradeBtn = document.getElementById("upgradeBtn");
const planElements = document.querySelectorAll(".plan");

// State
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
let isDarkMode = localStorage.getItem("theme") !== "light";
let lastCalculationResult = null;
let lastCalculationExpression = null;
let hasUpgraded = false;

// Initialize
init();

function init() {
  setTheme(isDarkMode);
  renderHistory();
  attachEventListeners();
}

function attachEventListeners() {
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");
      handleClick(value);
    });
  });

  themeBtn.addEventListener("click", toggleTheme);
  clearHistoryBtn.addEventListener("click", clearHistory);
  closeModalBtn.addEventListener("click", closeModal);
  upgradeBtn.addEventListener("click", handleUpgrade);
  premiumModal.addEventListener("click", (e) => {
    if (e.target === premiumModal) closeModal();
  });

  // Add plan selection listeners
  planElements.forEach((plan) => {
    plan.addEventListener("click", (e) => {
      planElements.forEach((p) => p.classList.remove("selected"));
      plan.classList.add("selected");
    });
  });

  // Keyboard support
  document.addEventListener("keydown", handleKeyboard);
}

function handleClick(value) {
  try {
    if (value === "C") {
      display.value = "";
    } else if (value === "DEL") {
      display.value = display.value.slice(0, -1);
    } else if (value === "=") {
      calculate();
    } else {
      display.value += value;
    }
  } catch (error) {
    display.value = "Error";
  }
}

function calculate() {
  try {
    const expression = display.value;
    if (!expression) return;

    // Safe evaluation
    const result = Function('"use strict"; return (' + expression + ")")();

    // Store result and expression
    lastCalculationResult = result;
    lastCalculationExpression = expression;

    // Display "Please Upgrade!" instead of result
    display.value = "Please Upgrade!";

    // Show premium modal
    showPremiumModal(expression, result);
  } catch (error) {
    display.value = "Error";
  }
}

function showPremiumModal(expression, result) {
  document.body.classList.add("modal-open");
  premiumModal.classList.add("show");
}

function closeModal() {
  document.body.classList.remove("modal-open");
  premiumModal.classList.remove("show");
  
  // Only reset if user didn't upgrade
  if (!hasUpgraded) {
    display.value = "Please Upgrade!";
  }
}

function handleUpgrade() {
  const originalText = upgradeBtn.textContent;

  upgradeBtn.disabled = true;
  upgradeBtn.classList.remove("completed");
  upgradeBtn.classList.add("loading");
  upgradeBtn.textContent = "Processing...";

  setTimeout(() => {
    upgradeBtn.classList.remove("loading");
    upgradeBtn.classList.add("completed");
    upgradeBtn.textContent = "Success";

    setTimeout(() => {
      // Show the actual result
      if (
        lastCalculationResult !== null &&
        lastCalculationExpression !== null
      ) {
        display.value = lastCalculationResult;
        addToHistory(`${lastCalculationExpression} = ${lastCalculationResult}`);
        hasUpgraded = true;
      }

      upgradeBtn.disabled = false;
      upgradeBtn.classList.remove("completed");
      upgradeBtn.textContent = originalText;

      alert("Thank you for your interest! Upgrade feature coming soon.");
      closeModal();
      
      // Reset for next calculation
      hasUpgraded = false;
      lastCalculationResult = null;
      lastCalculationExpression = null;
    }, 900);
  }, 3000);
}

function handleKeyboard(e) {
  const key = e.key;

  if (key === "Enter") {
    e.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    e.preventDefault();
    display.value = display.value.slice(0, -1);
  } else if (key === "Escape") {
    e.preventDefault();
    display.value = "";
  } else if (
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."].includes(key)
  ) {
    e.preventDefault();
    display.value += key;
  } else if (["+", "-", "*", "/"].includes(key)) {
    e.preventDefault();
    display.value += key;
  }
}

function addToHistory(item) {
  history.unshift(item);
  if (history.length > 10) history.pop();
  localStorage.setItem("calcHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = history
    .map(
      (item, index) =>
        `<div class="history-item" onclick="useHistoryItem('${index}')">${item}</div>`,
    )
    .join("");
}

function useHistoryItem(index) {
  const item = history[index];
  const result = item.split(" = ")[1];
  display.value = result;
}

function clearHistory() {
  history = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  setTheme(isDarkMode);
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

function setTheme(dark) {
  if (dark) {
    document.body.classList.remove("light-mode");
    themeBtn.textContent = "☀️";
  } else {
    document.body.classList.add("light-mode");
    themeBtn.textContent = "🌙";
  }
}
