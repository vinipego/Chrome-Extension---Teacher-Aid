const timerInput = document.querySelector(".timer-input");
const playButton = document.querySelector(".play-button");
const stopResumeButton = document.querySelector(".stop-resume-button");
const resetButton = document.querySelector(".reset-button");
const tooltip = document.querySelector(".tooltip");

// Timer variables
let countdown; // Reference for setInterval
let remainingTime = 0; // Total time in seconds
let isRunning = false; // Timer state
let initialTime = 0; // Store the original user input in seconds
let audio = undefined; // Declare a variable to hold the audio instance

timerInput.addEventListener("input", (e) => {
  let value = e.target.value;
  console.log(e.target.value);
  // Remove non-numeric characters except for ':'
  // more information on how to remove characters with exceptions here:
  // src: https://stackoverflow.com/questions/2555059/javascript-regular-expressions-replace-non-numeric-characters
  value = value.replace(/[^0-9:]/g, "");

  // Add colon automatically after 2 digits
  if (value.length > 2 && value.indexOf(":") === -1) {
    value = value.slice(0, 2) + ":" + value.slice(2);
  }

  // Split into minutes and seconds for validation
  // <!> this is called Destructuring assignment. Here's how it works src: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  let [minutes, seconds] = value.split(":");

  // Ensure minutes and seconds are valid numbers.
  // the variable minutes is coming from a .split() which means it's a string. parseInt() turns it back into an Integer number.
  if (parseInt(minutes) > 59) {
    minutes = "59";
  }
  if (parseInt(seconds) > 59) {
    seconds = "59";
  }

  // Recombine minutes and seconds into valid format
  value = seconds !== undefined ? `${minutes}:${seconds}` : minutes;

  // Limit to 5 characters total (MM:SS)
  value = value.slice(0, 5);

  // Update the input field value
  e.target.value = value;
}); // end of timerInput event listener

// The timerInput will react to the enter key as well
timerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      playButton.click(); // Simulate a click on the Play button
    }
  });

// Show the tooltip
function showTooltip(message) {
  tooltip.textContent = message; // Set the tooltip text
  tooltip.hidden = false; // Make the tooltip visible
  setTimeout(() => {
    tooltip.hidden = true; // Hide the tooltip after 3 seconds
  }, 3000);
}

function startCountdown() {
  isRunning = true; // Set the timer state to "running"

  countdown = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--; // Decrement time by 1 second

      // Update the timer display
      updateTimerDisplay(remainingTime);
    } else {
      // Stop the timer when it reaches 0
      clearInterval(countdown);
      isRunning = false;

      // Play the sound when the timer ends
      playSound();
      playButton.hidden = true;
      stopResumeButton.hidden = true;
      resetButton.hidden = false;
    }
  }, 1000); // Run every 1000 milliseconds (1 second)
}

function updateTimerDisplay(time) {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0"); // Get minutes
  const seconds = (time % 60).toString().padStart(2, "0"); // Get seconds

  timerInput.value = `${minutes}:${seconds}`; // Update the input field
}

// Start the timer
playButton.addEventListener("click", () => {
  let timerValue = timerInput.value.trim(); // Get input value and remove extra spaces

  // If input has no colon, interpret it as seconds
  if (!timerValue.includes(":")) {
    timerValue = `00:${timerValue.padStart(2, "0")}`; // Format as MM:SS
    timerInput.value = timerValue; // Update the input field visually
  }

  // Parse input (MM:SS) into minutes and seconds
  const [minutes, seconds] = timerValue.split(":").map(Number);

  // Convert to total seconds
  remainingTime = minutes * 60 + seconds;
  initialTime = remainingTime;
  // Prevent invalid or empty input
  if (isNaN(remainingTime) || remainingTime <= 0) {
    showTooltip("Please enter a valid time!"); // Show tooltip instead of alert
    return;
  }

  // Switch input to display mode
  timerInput.disabled = true;
  // Hide "Play" button and show "Pause" and "Reset" buttons
  playButton.hidden = true;
  stopResumeButton.hidden = false;
  resetButton.hidden = false;

  // Start the countdown
  startCountdown();
});

stopResumeButton.addEventListener("click", () => {
  if (isRunning) {
    // Pause the timer
    clearInterval(countdown); // Stop the countdown
    isRunning = false; // Update state
    stopResumeButton.textContent = "Resume"; // Change button text
  } else {
    // Resume the timer
    startCountdown(); // Restart the countdown
    stopResumeButton.textContent = "Pause"; // Change button text
  }
});

resetButton.addEventListener("click", () => {
  // Stop the timer
  clearInterval(countdown);
  isRunning = false;
  remainingTime = initialTime;

  // Reset the timer display
  timerInput.disabled = false; // Make the input editable again
  stopResumeButton.hidden = true; // Hide "Stop/Resume" button
  resetButton.hidden = true; // Hide "Reset" button
  playButton.hidden = false; // Show "Play" button

  // Reset the input field
  updateTimerDisplay(remainingTime); // Reset to the last input value

  if (audio && !audio.paused) {
    audio.pause(); // Pause the audio
    audio.currentTime = 0; // Reset playback to the start
    audio = undefined; // Clear the audio reference
  }
});

function playSound() {
    audio = document.getElementById("timer-sound");
  try {
    audio.play(); // Try to play the sound
  } catch (error) {
    // Log a warning if it fails
    console.warn("Sound could not be played:", error);
  }
}
