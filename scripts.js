const timerInput = document.querySelector(".timer-input");
const playButton = document.querySelector(".play-button");
const stopResumeButton = document.querySelector(".stop-resume-button");
const resetButton = document.querySelector(".reset-button");
const tooltip = document.querySelector(".tooltip");
const tenMinuteShortcut = document.querySelector("#ten-minute-shortcut");
const fiveMinuteShortcut = document.querySelector("#five-minute-shortcut");
const oneMinuteShortcut = document.querySelector("#one-minute-shortcut");
const halfMinuteShortcut = document.querySelector("#half-minute-shortcut");
const predefinedTimesContainer = document.querySelector(".predefined-times");
const notesArea = document.querySelector("#notes-area");
const saveNotes = document.querySelector("#save-notes-button");
const resumeNotes = document.querySelector("#resume-notes-button");


// Select the progress circle
const progressCircle = document.querySelector(".progress-ring__circle");

// Calculate the circumference of the circle (2 * π * radius)
const radius = 16; // Matches the "r" attribute in the SVG
const circumference = 2 * Math.PI * radius;
// Set the circle's initial properties
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = `${circumference}`;

// Timer variables
let countdown; // Reference for setInterval
let remainingTime = 0; // Total time in seconds
let isRunning = false; // Timer state
let paused = false; // Stop/Resume btns state
let initialTime = 0; // Store the original user input in seconds
let audio = undefined; // Declare a variable to hold the audio instance

// review
if(localStorage.getItem("savedNotes")){
  resumeNotes.hidden = false;
}


timerInput.addEventListener("input", (e) => {
  let value = e.target.value;
  // console.log(e.target.value);
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
});

// The timerInput will react to the enter key as well
timerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    playButton.click(); // Simulate a click on the Play button
  }
});

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
    timerInput.value = "";
    showTooltip("Please enter a valid time!", 2000);

    return; // Prevents disabling the input
  }

  // Switch input to display mode
  timerInput.disabled = true;
  // Hide "Play" button and show "Pause" and "Reset" buttons
  playButton.hidden = true;
  stopResumeButton.hidden = false;
  resetButton.hidden = false;

  // Start the countdown
  startCountdown();
  greyShortcutButtons();
  
});

stopResumeButton.addEventListener("click", () => {
  if (isRunning) {
    // Pause the timer
    clearInterval(countdown); // Stop the countdown
    isRunning = false;
    paused = true;
    stopResumeButton.textContent = "Resume"; // Change button text
  } else {
    // Resume the timer
    startCountdown(); // Restart the countdown
    stopResumeButton.textContent = "Pause"; // Change button text
    paused = false;
  }
});

resetButton.addEventListener("click", () => {
  // Stop the timer
  clearInterval(countdown);
  isRunning = false;
  paused = false;
  remainingTime = initialTime;

  // Reset the timer display
  timerInput.disabled = false; // Make the input editable again
  stopResumeButton.hidden = true; // Hide "Stop/Resume" button
  resetButton.hidden = true; // Hide "Reset" button
  playButton.hidden = false; // Show "Play" button

  // Reset the input field
  updateTimerDisplay(remainingTime); // Reset to the last input value
  greyShortcutButtons();

  // Reset the progress circle
  progressCircle.style.strokeDashoffset = `${circumference}`;
  if (audio && !audio.paused) {
    audio.pause(); // Pause the audio
    audio.currentTime = 0; // Reset playback to the start
    audio = undefined; // Clear the audio reference
  }
});

tenMinuteShortcut.addEventListener("click", () => {
  if (!isRunning && !paused) {
    timerInput.value = "10:00";
  }
});

fiveMinuteShortcut.addEventListener("click", () => {
  if (!isRunning && !paused) {
    timerInput.value = "05:00";
  }
});

oneMinuteShortcut.addEventListener("click", () => {
  if (!isRunning && !paused) {
    timerInput.value = "01:00";
  }
});

halfMinuteShortcut.addEventListener("click", () => {
  if (!isRunning && !paused) {
    timerInput.value = "00:30";
  }
});

saveNotes.addEventListener("click", () => {

  if(notesArea.value){
    localStorage.setItem("savedNotes", notesArea.value);
    console.log(localStorage.getItem("savedNotes"));
    resumeNotes.hidden = false;
  }else{
    localStorage.removeItem("savedNotes");
    resumeNotes.hidden = true;
  }
});

resumeNotes.addEventListener("click", () =>{
notesArea.textContent = localStorage.getItem("savedNotes");
});


// Show the tooltip
function showTooltip(message, delay) {
  // console.log("Tooltip message:", message);
  tooltip.textContent = message;
  tooltip.hidden = false;
  // console.log("Tooltip state after show:", tooltip.hidden);

  setTimeout(() => {
    // console.log("Hiding tooltip");
    tooltip.hidden = true;
  }, delay);
}

function startCountdown() {
  isRunning = true; // Set the timer state to "running"

  countdown = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--; // Decrement time by 1 second

      // Update the timer display
      updateTimerDisplay(remainingTime);
      // Update the progress circle
      updateProgress(remainingTime, initialTime);
    } else {
      // Stop the timer when it reaches 0
      clearInterval(countdown);
      isRunning = false;

      // Play the sound when the timer ends
      playSound();

      timerInput.disabled = false;

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

function playSound() {
  audio = document.getElementById("timer-sound");
  try {
    audio.play(); // Try to play the sound
  } catch (error) {
    // Log a warning if it fails
    console.warn("Sound could not be played:", error);
  }
}

function updateProgress(remainingTime, initialTime) {
  const progress = remainingTime / initialTime; // Calculate remaining percentage
  const offset = circumference - progress * circumference; // Calculate offset
  progressCircle.style.strokeDashoffset = offset; // Apply the offset
}

function greyShortcutButtons(yes) {
  if (isRunning) {
    tenMinuteShortcut.classList.add("grey-out");
    fiveMinuteShortcut.classList.add("grey-out");
    oneMinuteShortcut.classList.add("grey-out");
    halfMinuteShortcut.classList.add("grey-out");
  } else {
    tenMinuteShortcut.classList.remove("grey-out");
    fiveMinuteShortcut.classList.remove("grey-out");
    oneMinuteShortcut.classList.remove("grey-out");
    halfMinuteShortcut.classList.remove("grey-out");
  }
}
