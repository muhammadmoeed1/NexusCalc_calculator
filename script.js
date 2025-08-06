document.addEventListener('DOMContentLoaded', () => {
    // Calculator state
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetInput = false;
    let calculationHistory = [];

    // DOM elements
    const resultDisplay = document.getElementById('result');
    const operationDisplay = document.getElementById('operation');
    const historyItems = document.getElementById('history-items');
    const clearHistoryBtn = document.getElementById('clear-history');
    const buttons = document.querySelectorAll('.btn');

    // Initialize calculator
    updateDisplay();

    // Button click event listeners
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleInput(value);
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        let value = null;

        switch (key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                value = key;
                break;
            case '+':
                value = '+';
                break;
            case '-':
                value = '-';
                break;
            case '*':
                value = '×';
                break;
            case '/':
                value = '÷';
                break;
            case '%':
                value = '%';
                break;
            case '.':
                value = '.';
                break;
            case 'Enter':
                value = '=';
                e.preventDefault();
                break;
            case 'Backspace':
                deleteLast();
                updateDisplay();
                return;
            case 'Escape':
                value = 'C';
                break;
            case '_':
                toggleSign();
                updateDisplay();
                return;
        }

        if (value !== null) {
            // Find and highlight the pressed button
            const button = Array.from(buttons).find(btn => 
                btn.getAttribute('data-value') === value ||
                (value === '=' && btn.getAttribute('data-value') === '=') ||
                (value === '−' && btn.getAttribute('data-value') === '-')
            );
            
            if (button) {
                button.classList.add('active');
                setTimeout(() => button.classList.remove('active'), 100);
            }
            
            handleInput(value);
        }
    });

    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Handle all inputs
    function handleInput(value) {
        if (!isNaN(value) || value === '.') {
            appendNumber(value);
        } else if (value === '±') {
            toggleSign();
        } else if (value === '%') {
            percentage();
        } else if (value === 'C') {
            clearAll();
        } else if (value === '=') {
            calculate();
        } else {
            chooseOperation(value);
        }
        
        updateDisplay();
    }

    // Append number or decimal
    function appendNumber(number) {
        if (resetInput) {
            currentInput = '0';
            resetInput = false;
        }
        
        if (number === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }
    }

    // Toggle positive/negative
    function toggleSign() {
        currentInput = (parseFloat(currentInput) * -1).toString();
    }

    // Convert to percentage
    function percentage() {
        currentInput = (parseFloat(currentInput) / 100).toString();
    }

    // Clear all
    function clearAll() {
        currentInput = '0';
        previousInput = '';
        operation = null;
    }

    // Delete last character
    function deleteLast() {
        if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
    }

    // Choose operation
    function chooseOperation(op) {
        if (currentInput === '0' && previousInput === '') return;
        
        if (previousInput !== '') {
            calculate();
        }
        
        operation = op;
        previousInput = currentInput;
        resetInput = true;
    }

    // Perform calculation
    function calculate() {
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }
        
        // Add to history
        if (computation !== 'Error') {
            addToHistory(previousInput, operation, currentInput, computation.toString());
        }
        
        currentInput = computation.toString();
        operation = null;
        previousInput = '';
        resetInput = true;
        
        // Add pop animation to result
        resultDisplay.classList.add('pop-animation');
        setTimeout(() => resultDisplay.classList.remove('pop-animation'), 300);
    }

    // Update display
    function updateDisplay() {
        resultDisplay.textContent = currentInput;
        
        if (operation !== null) {
            // Replace - with proper minus symbol for display
            const displayOperation = operation === '-' ? '−' : operation;
            operationDisplay.textContent = `${previousInput} ${displayOperation}`;
        } else {
            operationDisplay.textContent = '';
        }
    }

    // Add calculation to history
    function addToHistory(firstOperand, operator, secondOperand, result) {
        // Replace - with proper minus symbol for history
        const displayOperator = operator === '-' ? '−' : operator;
        
        const historyItem = {
            expression: `${firstOperand} ${displayOperator} ${secondOperand}`,
            result: result
        };
        
        calculationHistory.unshift(historyItem);
        renderHistory();
    }

    // Render history items
    function renderHistory() {
        historyItems.innerHTML = '';
        
        calculationHistory.forEach((item, index) => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.style.animationDelay = `${index * 0.05}s`;
            historyElement.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
            `;
            
            // Click to reuse result
            historyElement.addEventListener('click', () => {
                currentInput = item.result;
                resetInput = true;
                updateDisplay();
            });
            
            historyItems.appendChild(historyElement);
        });
    }

    // Clear history
    function clearHistory() {
        calculationHistory = [];
        renderHistory();
    }
});