"use strict";

/* =========================================
   NEXA VISUAL INTERFACE
   Frontend only — no API / no backend
========================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ELEMENTS */

const commandInput = $("#commandInput");
const sendButton = $("#sendButton");
const logContent = $("#logContent");
const voiceText = $("#voiceText");
const coreState = $("#coreState");
const reactor = $("#reactor");

const menuButton = $("#menuButton");
const menuOverlay = $("#menuOverlay");
const closeMenu = $("#closeMenu");

/* =========================================
   CLOCK
========================================= */

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-US", {
    hour12: false
  });

  $("#clock").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

/* =========================================
   SYSTEM METRICS
========================================= */

function randomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateMetric(valueId, barId, min, max) {
  const value = randomValue(min, max);

  $(valueId).textContent = `${value}%`;
  $(barId).style.width = `${value}%`;
}

function updateSystemMetrics() {
  updateMetric("#cpuValue", "#cpuBar", 12, 72);
  updateMetric("#gpuValue", "#gpuBar", 18, 82);
  updateMetric("#ramValue", "#ramBar", 42, 78);
  updateMetric("#diskValue", "#diskBar", 30, 64);
}

setInterval(updateSystemMetrics, 2500);

/* =========================================
   BATTERY VISUAL
========================================= */

let battery = 87;

function updateBattery() {
  battery += Math.random() > 0.5 ? 0 : -1;

  if (battery < 72) {
    battery = 87;
  }

  $("#batteryLevel").style.width = `${battery}%`;
  $("#batteryText").textContent = `${battery}%`;
}

setInterval(updateBattery, 8000);

/* =========================================
   LOG SYSTEM
========================================= */

function addLog(message, type = "INFO") {
  const line = document.createElement("div");

  line.innerHTML = `
    <span>[${type}]</span> ${escapeHTML(message)}
  `;

  logContent.appendChild(line);
  logContent.scrollTop = logContent.scrollHeight;

  while (logContent.children.length > 18) {
    logContent.removeChild(logContent.firstElementChild);
  }
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* =========================================
   VOICE VISUALIZER
========================================= */

let voiceTimer = null;

function voiceActivity(message) {
  voiceText.textContent = message;

  clearTimeout(voiceTimer);

  voiceTimer = setTimeout(() => {
    voiceText.textContent = "NEXA READY";
  }, 1800);
}

/* =========================================
   CORE MODES
========================================= */

function setCoreMode(mode) {

  document.body.classList.remove(
    "power-mode",
    "surge-mode"
  );

  $$(".control-button").forEach(button => {
    button.classList.remove("active");
  });

  const selected = document.querySelector(
    `[data-mode="${mode}"]`
  );

  if (selected) {
    selected.classList.add("active");
  }

  if (mode === "stable") {
    coreState.textContent = "STABLE";
    voiceActivity("CORE STABLE");
    addLog("Arc reactor operating at stable output.", "CORE");
  }

  if (mode === "power") {
    document.body.classList.add("power-mode");
    coreState.textContent = "POWER MODE";
    voiceActivity("POWER MODE");
    addLog("Power mode activated.", "POWER");
  }

  if (mode === "surge") {
    document.body.classList.add("surge-mode");
    coreState.textContent = "ENERGY SURGE";
    voiceActivity("ENERGY SURGE");
    addLog("Energy surge sequence activated.", "CORE");

    setTimeout(() => {
      document.body.classList.remove("surge-mode");
      coreState.textContent = "STABLE";
    }, 3500);
  }
}

$$(".control-button").forEach(button => {
  button.addEventListener("click", () => {
    setCoreMode(button.dataset.mode);
  });
});

/* =========================================
   COMMAND PROCESSOR
========================================= */

function processCommand(rawCommand) {

  const command = rawCommand.trim().toUpperCase();

  if (!command) {
    return;
  }

  addLog(`Command received: ${command}`, "CMD");

  switch (command) {

    case "SYSTEM":
    case "SYSTEM STATUS":
      voiceActivity("SYSTEM NOMINAL");
      addLog("All visual systems are nominal.", "OK");
      coreState.textContent = "SYSTEM NOMINAL";
      break;

    case "SCAN":
    case "FULL SCAN":
      voiceActivity("SCANNING");
      addLog("Running visual system scan...", "SCAN");

      setTimeout(() => {
        addLog("Core integrity: 100%.", "SCAN");
        addLog("Holographic renderer: ONLINE.", "SCAN");
        addLog("Interface integrity: 100%.", "SCAN");
        voiceActivity("SCAN COMPLETE");
      }, 900);
      break;

    case "DIAGNOSTICS":
    case "RUN DIAGNOSTICS":
      voiceActivity("DIAGNOSTICS");
      addLog("Running NEXA diagnostics...", "DIAG");

      setTimeout(() => {
        addLog("Reactor diagnostics passed.", "OK");
        addLog("HUD diagnostics passed.", "OK");
        addLog("Visual modules operational.", "OK");
        voiceActivity("DIAGNOSTICS COMPLETE");
      }, 1000);
      break;

    case "ACTIVATE":
      setCoreMode("power");
      addLog("NEXA visual power interface activated.", "POWER");
      break;

    case "POWER":
    case "POWER MODE":
      setCoreMode("power");
      break;

    case "STANDBY":
      setCoreMode("stable");
      coreState.textContent = "STANDBY";
      voiceActivity("STANDBY");
      addLog("NEXA entering visual standby mode.", "SYS");
      break;

    default:
      voiceActivity("COMMAND NOT RECOGNIZED");
      addLog(`Visual command not recognized: ${command}`, "WARN");
  }

  commandInput.value = "";
}

/* =========================================
   COMMAND INPUT
========================================= */

sendButton.addEventListener("click", () => {
  processCommand(commandInput.value);
});

commandInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    processCommand(commandInput.value);
  }
});

/* =========================================
   QUICK ACTIONS
========================================= */

$$("[data-command]").forEach(button => {

  button.addEventListener("click", () => {

    const command = button.dataset.command;

    processCommand(command);

    if (menuOverlay.classList.contains("show")) {
      menuOverlay.classList.remove("show");
    }
  });

});

/* =========================================
   MODULE INTERACTIONS
========================================= */

$$(".module-card").forEach(card => {

  card.addEventListener("click", () => {

    const module = card.dataset.module;

    switch (module) {

      case "weather":
        voiceActivity("WEATHER MODULE");
        addLog("Weather module selected. Visual mode only.", "MOD");
        break;

      case "camera":
        voiceActivity("CAMERA HUD");
        addLog("Camera HUD selected. Visual simulation only.", "MOD");
        break;

      case "theme":
        voiceActivity("THEME LOCK");
        addLog("Theme lock enabled.", "MOD");
        break;

      case "repulsor":
        voiceActivity("REPULSOR CHARGING");
        addLog("Repulsor visual charge sequence started.", "MOD");

        reactor.classList.add("charging");

        setCoreMode("surge");

        setTimeout(() => {
          reactor.classList.remove("charging");
        }, 3500);

        break;
    }

  });

});

/* =========================================
   MENU
========================================= */

menuButton.addEventListener("click", () => {
  menuOverlay.classList.add("show");
});

closeMenu.addEventListener("click", () => {
  menuOverlay.classList.remove("show");
});

menuOverlay.addEventListener("click", event => {
  if (event.target === menuOverlay) {
    menuOverlay.classList.remove("show");
  }
});

/* =========================================
   KEYBOARD SHORTCUT
========================================= */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    menuOverlay.classList.remove("show");
  }

  if (event.key === "/") {

    if (
      document.activeElement !== commandInput &&
      document.activeElement.tagName !== "INPUT"
    ) {
      event.preventDefault();
      commandInput.focus();
    }

  }

});

/* =========================================
   STARTUP SEQUENCE
========================================= */

const bootMessages = [
  ["Initializing NEXA Core Interface...", "BOOT"],
  ["Calibrating Arc Reactor Core...", "CORE"],
  ["Loading Repulsor Diagnostics...", "POWER"],
  ["Spinning Up Holographic Renderer...", "HOLO"],
  ["Establishing Satellite Uplink...", "LINK"],
  ["Neural Net Synchronized.", "AI"],
  ["All Systems Nominal. NEXA Online.", "OK"]
];

function runStartupSequence() {

  logContent.innerHTML = "";

  bootMessages.forEach((entry, index) => {

    setTimeout(() => {

      addLog(entry[0], entry[1]);

      if (index === bootMessages.length - 1) {
        voiceActivity("NEXA ONLINE");
      }

    }, index * 420);

  });
}

runStartupSequence();

/* =========================================
   MOUSE PARALLAX
========================================= */

if (window.matchMedia("(pointer: fine)").matches) {

  document.addEventListener("mousemove", event => {

    const x = (event.clientX / window.innerWidth - 0.5);
    const y = (event.clientY / window.innerHeight - 0.5);

    const amount = 4;

    reactor.style.transform =
      `translate(${x * amount}px, ${y * amount}px)`;
  });

}

/* =========================================
   TOUCH / PINCH VISUAL EFFECT
========================================= */

let touchStartDistance = null;

reactor.addEventListener("touchstart", event => {

  if (event.touches.length === 2) {

    touchStartDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );

  }

}, { passive: true });

reactor.addEventListener("touchmove", event => {

  if (
    event.touches.length === 2 &&
    touchStartDistance
  ) {

    const distance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );

    const scale = Math.max(
      0.85,
      Math.min(1.25, distance / touchStartDistance)
    );

    reactor.style.transform = `scale(${scale})`;
  }

}, { passive: true });

reactor.addEventListener("touchend", () => {
  touchStartDistance = null;
}, { passive: true });

/* =========================================
   INITIAL STATE
========================================= */

setTimeout(() => {
  addLog("Visual interface ready.", "READY");
}, 3400);