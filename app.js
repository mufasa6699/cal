/**
 * Calculator UI Controller
 * Handles button clicks, keyboard input, and output display.
 */
// 
(function () {
  'use strict';

//
  const expressionInput = document.getElementById('expression');
  const outputDisplay = document.getElementById('output');

  /** Insert text at cursor position in the input */
  function insertAtCursor(text) {
    const start = expressionInput.selectionStart;
    const end = expressionInput.selectionEnd;
    const before = expressionInput.value.substring(0, start);
    const after = expressionInput.value.substring(end);
    expressionInput.value = before + text + after;
    // Move cursor to after inserted text
    const newPos = start + text.length;
    expressionInput.selectionStart = newPos;
    expressionInput.selectionEnd = newPos;

    expressionInput.focus();
  }

  /** Append text at the end (fallback for older approach) */
  function appendToExpression(text) {
    expressionInput.value += text;
    expressionInput.focus();
  }

  /** Clear the expression input and output */
  function clearAll() {
    expressionInput.value = '';
    outputDisplay.textContent = '0';
    expressionInput.focus();
  }

  /** Delete last character */
  function backspace() {
    const start = expressionInput.selectionStart;
    const end = expressionInput.selectionEnd;
    if (start !== end) {
      // Delete selected range
      const before = expressionInput.value.substring(0, start);
      const after = expressionInput.value.substring(end);
      expressionInput.value = before + after;
      expressionInput.selectionStart = start;
      expressionInput.selectionEnd = start;
    } else if (start > 0) {
      // Delete character before cursor
      const before = expressionInput.value.substring(0, start - 1);
      const after = expressionInput.value.substring(start);
      expressionInput.value = before + after;
      expressionInput.selectionStart = start - 1;
      expressionInput.selectionEnd = start - 1;
    }
    expressionInput.focus();
  }
//
  /** Evaluate the expression and show result */
  function calculate() {
    const expr = expressionInput.value.trim();
    if (expr.length === 0) {
      outputDisplay.textContent = '0';
      return;
    }

    try {
      const result = evaluate(expr);
      // Fix to 4 decimal places, then remove trailing zeros (but keep at least one decimal digit if needed)
      const formatted = result.toFixed(4);
      outputDisplay.textContent = formatted;
    } catch (err) {
      outputDisplay.textContent = `Error: ${err.message}`;
    }
  }

  // ---- Button Handlers ----

  /** Handle click on any button */
  function handleButtonClick(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action || btn.dataset.value;
    const value = btn.dataset.value || '';

    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        backspace();
        break;
      case 'calculate':
        calculate();
        break;
      case 'insert':
        insertAtCursor(value);
        break;
      default:
        // Fallback: insert the dataset value
        if (value) {
          insertAtCursor(value);
        }
        break;
    }
  }

  // Attach click handlers to all calculator buttons
  function initButtons() {
    const buttons = document.querySelectorAll('.calc-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', handleButtonClick);
    });
  }

  // ---- Keyboard Handler ----

  function handleKeydown(e) {
    const key = e.key;

    // Handle Enter
    if (key === 'Enter') {
      e.preventDefault();
      calculate();
      return;
    }

    // Handle Escape -> clear
    if (key === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }

    // Handle Backspace is default for text input, but we let it work naturally
    // No special handling needed for most keys since the input is editable

    // Handle = key (prevent form submission behavior)
    if (key === '=' && !e.shiftKey) {
      e.preventDefault();
      calculate();
      return;
    }
  }

  // ---- Auto-evaluate on typing (optional helper: real-time preview) ----
  // We don't auto-evaluate on every keystroke to avoid cluttering output
  // with partial errors. User presses Enter or = to evaluate.

  // ---- Initialization ----

  function init() {
    initButtons();

    // Keyboard handling
    expressionInput.addEventListener('keydown', handleKeydown);

    // Focus the input on page load
    expressionInput.focus();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
