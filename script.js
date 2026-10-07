"use strict";

const MAX_DIGITS = 15;
const MAX_DECIMAL_PLACES = 8;
const THEME_STORAGE_KEY = "calculadora-theme";
const OPERATOR_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const state = {
  current: "0",
  accumulator: null,
  operator: null,
  waitingForOperand: false,
  completed: false,
  expression: "",
  error: false,
};

const displayElement = document.querySelector("#display");
const expressionElement = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-toggle__icon");

function roundResult(value) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(MAX_DECIMAL_PLACES));
}

function formatNumber(value) {
  const rounded = roundResult(value);
  if (rounded === null) return "Erro";
  return String(rounded);
}

function calculate(left, right, operator) {
  let result;

  switch (operator) {
    case "+": result = left + right; break;
    case "-": result = left - right; break;
    case "*": result = left * right; break;
    case "/":
      if (right === 0) return null;
      result = left / right;
      break;
    default: return null;
  }

  return roundResult(result);
}

function render() {
  displayElement.textContent = state.error ? "Erro" : state.current;
  expressionElement.textContent = state.expression;
  displayElement.setAttribute("aria-label", state.error ? "Erro" : `Visor: ${state.current}`);
}

function clearCalculator() {
  Object.assign(state, {
    current: "0",
    accumulator: null,
    operator: null,
    waitingForOperand: false,
    completed: false,
    expression: "",
    error: false,
  });
  render();
}

function showError() {
  state.current = "0";
  state.accumulator = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.completed = true;
  state.expression = "Não é possível dividir por zero";
  state.error = true;
  render();
}

function enterDigit(digit) {
  if (state.error || state.completed) clearCalculator();

  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    const digitCount = state.current.replace(/\D/g, "").length;
    if (digitCount >= MAX_DIGITS) return;
    state.current = state.current === "0" ? digit : `${state.current}${digit}`;
  }

  state.expression = state.operator
    ? `${formatNumber(state.accumulator)} ${OPERATOR_SYMBOLS[state.operator]}`
    : "";
  render();
}

function enterDecimal() {
  if (state.error || state.completed) clearCalculator();

  if (state.waitingForOperand) {
    state.current = "0.";
    state.waitingForOperand = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }

  state.expression = state.operator
    ? `${formatNumber(state.accumulator)} ${OPERATOR_SYMBOLS[state.operator]}`
    : "";
  render();
}

function chooseOperator(nextOperator) {
  if (state.error) return;

  const currentValue = Number(state.current);
  if (state.operator && !state.waitingForOperand) {
    const result = calculate(state.accumulator, currentValue, state.operator);
    if (result === null) return showError();
    state.accumulator = result;
    state.current = formatNumber(result);
  } else if (state.accumulator === null || state.completed) {
    state.accumulator = currentValue;
  }

  state.operator = nextOperator;
  state.waitingForOperand = true;
  state.completed = false;
  state.expression = `${formatNumber(state.accumulator)} ${OPERATOR_SYMBOLS[nextOperator]}`;
  render();
}

function calculateResult() {
  if (state.error || !state.operator || state.waitingForOperand) return;

  const left = state.accumulator;
  const right = Number(state.current);
  const operator = state.operator;
  const result = calculate(left, right, operator);

  if (result === null) return showError();

  state.expression = `${formatNumber(left)} ${OPERATOR_SYMBOLS[operator]} ${formatNumber(right)} =`;
  state.current = formatNumber(result);
  state.accumulator = null;
  state.operator = null;
  state.waitingForOperand = true;
  state.completed = true;
  render();
}

function toggleSign() {
  if (state.error) return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : state.current === "0" ? "-0" : `-${state.current}`;
  if (state.current === "-0") state.current = "0";
  state.completed = false;
  render();
}

function applyPercent() {
  if (state.error) return;
  const wasWaitingForOperand = state.waitingForOperand;
  state.current = formatNumber(Number(state.current) / 100);
  state.waitingForOperand = wasWaitingForOperand;
  state.completed = false;
  if (state.expression.endsWith("=")) state.expression = "";
  render();
}

function backspace() {
  if (state.error) return clearCalculator();

  if (state.completed) {
    state.completed = false;
    state.expression = "";
    const shortened = state.current.slice(0, -1);
    state.current = !shortened || shortened === "-" ? "0" : shortened;
    render();
    return;
  }

  if (state.waitingForOperand && state.operator) {
    state.operator = null;
    state.accumulator = null;
    state.waitingForOperand = false;
    state.expression = "";
  } else {
    const shortened = state.current.slice(0, -1);
    state.current = !shortened || shortened === "-" ? "0" : shortened;
    if (state.operator) {
      state.expression = `${formatNumber(state.accumulator)} ${OPERATOR_SYMBOLS[state.operator]}`;
    }
  }
  render();
}

function handleAction(action) {
  const actions = {
    clear: clearCalculator,
    sign: toggleSign,
    percent: applyPercent,
    decimal: enterDecimal,
    backspace,
    equals: calculateResult,
  };
  actions[action]?.();
}

function currentTheme() {
  return document.documentElement.dataset.theme
    || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function updateThemeButton() {
  const dark = currentTheme() === "dark";
  themeIcon.textContent = dark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", `Ativar tema ${dark ? "claro" : "escuro"}`);
  themeToggle.setAttribute("aria-pressed", String(dark));
}

function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {
    // A calculadora continua funcionando mesmo quando o armazenamento está indisponível.
  }
  updateThemeButton();
}

function toggleTheme() {
  const nextTheme = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // A preferência fica ativa durante esta visita, mesmo sem localStorage.
  }
  updateThemeButton();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "." || event.key === ",") enterDecimal();
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (event.key === "Escape") clearCalculator();
  else if (event.key === "%") applyPercent();
});

themeToggle.addEventListener("click", toggleTheme);
initializeTheme();
render();
