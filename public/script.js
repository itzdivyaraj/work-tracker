let totalMinutes = parseInt(localStorage.getItem("totalMinutes")) || 0;

const workTimeDisplay = document.getElementById("work-time");
const addBtn = document.getElementById("add-btn");
const subtractBtn = document.getElementById("subtract-btn");
const submitBtn = document.getElementById("submit-btn");

// Show formatted hours
function updateDisplay() {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  workTimeDisplay.textContent =
    mins === 0 ? `${hours}h` : `${(hours + mins / 60).toFixed(1)}h`;
}

function saveAndUpdate() {
  localStorage.setItem("totalMinutes", totalMinutes);
  updateDisplay();
}

// +30 mins
addBtn.addEventListener("click", () => {
  totalMinutes += 30;
  saveAndUpdate();
});

// -30 mins
subtractBtn.addEventListener("click", () => {
  totalMinutes = Math.max(0, totalMinutes - 30);
  saveAndUpdate();
});

// Submit the work
submitBtn.addEventListener("click", async () => {
  
  const confirmSubmit = confirm("Do you want to submit your work done today?");
  if (!confirmSubmit) return;

  const date = prompt("Enter date (e.g. 3-7-25):");
  if (!date) return;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const finalDisplay =
    mins === 0 ? `${hours}h` : `${(hours + mins / 60).toFixed(1)}h`;

  const response = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, hours: finalDisplay }),
  });

  const result = await response.json();
  alert(result.message);

  totalMinutes = 0;
  localStorage.removeItem("totalMinutes");
  updateDisplay();
});

// Init on load
updateDisplay();
