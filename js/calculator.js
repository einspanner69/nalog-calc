// Получаем элементы
const yearsInput = document.getElementById('years');
const isSoleResidenceCheck = document.getElementById('isSoleResidence');
const sellPriceTextInput = document.getElementById('sellPriceInput');
const cadastralTextInput = document.getElementById('cadastralInput');
const deductFixedRadio = document.getElementById('deductFixed');
const deductExpensesRadio = document.getElementById('deductExpenses');
const expensesAmountTextInput = document.getElementById('expensesAmountInput');
const expensesWrapper = document.getElementById('expensesInputWrapper');
const taxBaseSpan = document.getElementById('taxBaseDisplay');
const tax13Span = document.getElementById('tax13Display');
const tax15Span = document.getElementById('tax15Display');
const taxSpan = document.getElementById('taxDisplay');
const tax15Row = document.getElementById('tax15Row');
const resetBtn = document.getElementById('resetBtn');

// Радио-кнопки способа перехода
const ownershipPurchase = document.getElementById('ownershipPurchase');
const ownershipPrivatization = document.getElementById('ownershipPrivatization');
const ownershipInheritance = document.getElementById('ownershipInheritance');
const ownershipGiftStranger = document.getElementById('ownershipGiftStranger');
const ownershipGiftRelative = document.getElementById('ownershipGiftRelative');
const ownershipLifeAnnuity = document.getElementById('ownershipLifeAnnuity');

// Функция форматирования числа с пробелами
function formatNumber(value) {
    if (value === '' || value === null || isNaN(value)) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('ru-RU');
}

// Функция получения числа из отформатированного поля
function parseFormattedValue(formattedValue) {
    if (!formattedValue) return 0;
    const cleanValue = formattedValue.toString().replace(/\s/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
}

// Функция получения числовых значений из полей
function getNumericValues() {
    const sellPrice = parseFormattedValue(sellPriceTextInput.value);
    const cadastral = parseFormattedValue(cadastralTextInput.value);
    const expenses = parseFormattedValue(expensesAmountTextInput.value);
    return { sellPrice, cadastral, expenses };
}

// Функция для получения выбранного способа перехода
function getOwnershipType() {
    if (ownershipPurchase.checked) return 'purchase';
    if (ownershipPrivatization.checked) return 'privatization';
    if (ownershipInheritance.checked) return 'inheritance';
    if (ownershipGiftStranger.checked) return 'gift_stranger';
    if (ownershipGiftRelative.checked) return 'gift_relative';
    if (ownershipLifeAnnuity.checked) return 'life_annuity';
    return 'purchase';
}

// Проверка, облагается ли налогом данный способ перехода
function isTaxable() {
    const type = getOwnershipType();
    return type === 'purchase' || type === 'gift_stranger';
}

// Проверка освобождения от налога по сроку владения
function isExemptByYears(years, isSole) {
    if (years <= 0) return false;
    if (isSole) {
        return years >= 3;
    } else {
        return years >= 5;
    }
}

// Расчет налога с разделением на 13% и 15%
function calculateSplitTax(taxBase) {
    const threshold = 2400000;
    if (taxBase <= threshold) {
        return {
            tax13: taxBase * 0.13,
            tax15: 0,
            total: taxBase * 0.13
        };
    } else {
        const base13 = threshold;
        const base15 = taxBase - threshold;
        return {
            tax13: base13 * 0.13,
            tax15: base15 * 0.15,
            total: (base13 * 0.13) + (base15 * 0.15)
        };
    }
}

// Основная функция расчёта налога
function calculateTax() {
    // Получаем значения
    let years = parseFloat(yearsInput.value);
    if (isNaN(years)) years = 0;

    const isSole = isSoleResidenceCheck.checked;
    const taxableOwnership = isTaxable();

    const { sellPrice, cadastral, expenses } = getNumericValues();

    // Проверка освобождения от налога по сроку владения
    if (years > 0 && isExemptByYears(years, isSole)) {
        taxBaseSpan.innerText = '0 ₽';
        tax13Span.innerText = '0 ₽';
        tax15Span.innerText = '0 ₽';
        taxSpan.innerText = '0 ₽';
        tax15Row.style.display = 'none';
        return;
    }

    // Если способ перехода не облагается налогом
    if (!taxableOwnership) {
        taxBaseSpan.innerText = '0 ₽';
        tax13Span.innerText = '0 ₽';
        tax15Span.innerText = '0 ₽';
        taxSpan.innerText = '0 ₽';
        tax15Row.style.display = 'none';
        return;
    }

    // Если нет данных для расчета
    if (sellPrice === 0 && cadastral === 0) {
        taxBaseSpan.innerText = '0 ₽';
        tax13Span.innerText = '0 ₽';
        tax15Span.innerText = '0 ₽';
        taxSpan.innerText = '0 ₽';
        tax15Row.style.display = 'none';
        return;
    }

    // ОСНОВНАЯ ЛОГИКА:
    // 1. Считаем 70% от кадастровой стоимости
    const seventyPercentCadastral = cadastral * 0.7;
    
    // 2. Сравниваем с ценой продажи, берем БОЛЬШЕЕ
    let comparisonValue;
    
    if (seventyPercentCadastral > sellPrice) {
        comparisonValue = seventyPercentCadastral;
    } else {
        comparisonValue = sellPrice;
    }

    // 3. Применяем вычет
    let deduction = 0;
    if (deductFixedRadio.checked) {
        deduction = 1000000;
    } else if (deductExpensesRadio.checked && expenses > 0) {
        deduction = expenses;
    }

    const taxBase = Math.max(0, comparisonValue - deduction);
    
    // 4. Расчет налога с разделением
    const taxResult = calculateSplitTax(taxBase);

    // Форматируем вывод
    taxBaseSpan.innerText = formatNumber(taxBase) + ' ₽';
    tax13Span.innerText = formatNumber(taxResult.tax13) + ' ₽';
    
    if (taxResult.tax15 > 0) {
        tax15Span.innerText = formatNumber(taxResult.tax15) + ' ₽';
        tax15Row.style.display = 'flex';
    } else {
        tax15Row.style.display = 'none';
    }
    
    taxSpan.innerText = formatNumber(taxResult.total) + ' ₽';
}

// Показывать/скрывать поле расходов
function toggleExpensesInput() {
    if (deductExpensesRadio.checked) {
        expensesWrapper.style.display = 'block';
    } else {
        expensesWrapper.style.display = 'none';
    }
    calculateTax();
}

// Сброс всех полей
function resetAllFields() {
    yearsInput.value = '';
    isSoleResidenceCheck.checked = false;
    ownershipPurchase.checked = true;
    sellPriceTextInput.value = '';
    cadastralTextInput.value = '';
    deductFixedRadio.checked = true;
    deductExpensesRadio.checked = false;
    expensesAmountTextInput.value = '';
    toggleExpensesInput();
    calculateTax();
}

function onOwnershipChange() {
    calculateTax();
}

// Обработчики для полей ввода с форматированием
function setupFormattedInput(inputElement) {
    inputElement.addEventListener('input', function(e) {
        let value = this.value.replace(/\s/g, '');
        if (value === '') {
            calculateTax();
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num)) {
            this.value = formatNumber(num);
        }
        calculateTax();
    });
    
    inputElement.addEventListener('blur', function() {
        if (this.value === '') return;
        const num = parseFormattedValue(this.value);
        if (!isNaN(num) && num !== 0) {
            this.value = formatNumber(num);
        }
    });
}

// Настройка форматирования полей
setupFormattedInput(sellPriceTextInput);
setupFormattedInput(cadastralTextInput);
setupFormattedInput(expensesAmountTextInput);

// Навешиваем обработчики событий
yearsInput.addEventListener('input', calculateTax);
isSoleResidenceCheck.addEventListener('change', calculateTax);

ownershipPurchase.addEventListener('change', onOwnershipChange);
ownershipPrivatization.addEventListener('change', onOwnershipChange);
ownershipInheritance.addEventListener('change', onOwnershipChange);
ownershipGiftStranger.addEventListener('change', onOwnershipChange);
ownershipGiftRelative.addEventListener('change', onOwnershipChange);
ownershipLifeAnnuity.addEventListener('change', onOwnershipChange);

deductFixedRadio.addEventListener('change', () => {
    toggleExpensesInput();
    calculateTax();
});
deductExpensesRadio.addEventListener('change', () => {
    toggleExpensesInput();
    calculateTax();
});

resetBtn.addEventListener('click', resetAllFields);

// Инициализация
toggleExpensesInput();
calculateTax();
