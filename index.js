var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var btns = document.querySelectorAll("[data-value]");
var historyElement = document.querySelector(".computation-history");
var screenElement = document.querySelector("[data-screen]");
var historyBtn = document.querySelector(".history-btn");
var slidingPart = document.querySelector(".sliding-part");
var computationHistoryParent = document.querySelector(".computation-history-parent");
var operators = document.querySelectorAll("[data-operator]");
var clearHistoryBtn = document.querySelector(".clear-history-btn");
var currentExpression;
var operatorRegex = /[\/*\-+]/;
var ZERO = 0;
var ZERO_DOT = "0.";
var HISTORY_LIMIT = 10;
var history2 = [];
var data = [];
clearHistoryBtn.addEventListener("click", function () {
    historyElement.innerHTML = "";
});
document.addEventListener("keydown", handleKeyPress);
window.addEventListener("DOMContentLoaded", function () {
    var history = getHistoryFromLocalStorage();
    createHistoryList(history, historyElement);
});
function handleKeyPress(event) {
    var key = event.key;
    var button = document.querySelector("[data-value=\"".concat(key, "\"]"));
    if (button) {
        button.click();
    }
    if (event.code === "Backspace") {
        var newArray = data.slice(ZERO, -1);
        screenElement.innerText = newArray.join("");
        data = newArray;
        if (screenElement.innerText === "") {
            screenElement.innerText = ZERO.toString();
        }
    }
    if (event.code === "Enter") {
        userClicksOnEqualButton("=");
    }
}
historyBtn.addEventListener("click", function () {
    slidingPart.classList.toggle("slide");
    computationHistoryParent.classList.toggle("visility");
});
btns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        var buttonValue = e.target.dataset.value;
        insertOpeningParenthesis(buttonValue);
        insertClosingParenthesis(buttonValue);
        deleteEverythingFromScreen(buttonValue);
        toggleSign(buttonValue);
        canUserAddDot(buttonValue);
        userClicksOnEqualButton(buttonValue);
        handlingZeroFollowedByAdecimal(buttonValue);
        removesDecimalPointIfPrecededByAnOperator(buttonValue);
        handleNumberButton(buttonValue);
        deteLastEntry(buttonValue);
        convertToPercentage(buttonValue);
    });
});
function convertToPercentage(button) {
    if (button === "%") {
        currentExpression = data.join('');
        currentExpression = Number(currentExpression) / 100;
        data = [currentExpression];
        screenElement.innerText = currentExpression.toString();
    }
}
function deteLastEntry(button) {
    if (button === "DE") {
        var newArray = data.slice(ZERO, -1);
        screenElement.innerText = newArray.join("");
        data = newArray;
        if (screenElement.innerText === "") {
            screenElement.innerText = ZERO.toString();
        }
    }
}
function canUserAddDot(button) {
    if (button === ".") {
        var dotAllowed = true;
        for (var i = data.length - 1; i >= ZERO; i--) {
            if (data[i] === ".") {
                dotAllowed = false;
                break;
            }
            else if (typeof data[i] === 'string' && operatorRegex.test(data[i].toString())) {
                break;
            }
        }
        if (dotAllowed) {
            if (data.length == ZERO) {
                data.push("0");
            }
            else if (typeof data[data.length - 1] === 'string' && operatorRegex.test(data[data.length - 1].toString())) {
                data.push("0");
            }
            data.push(".");
        }
        screenElement.innerText = data.join("");
    }
}
function deleteEverythingFromScreen(button) {
    if (button === "AC") {
        screenElement.innerText = "";
        data = [];
        screenElement.innerText = ZERO.toString();
    }
}
function toggleSign(button) {
    if (button === "minus") {
        currentExpression = data.join("");
        var reversedExpression = currentExpression.split("").join("");
        var match = reversedExpression.match(/(\d+(\.\d+)?)|(\D+)/);
        if (match) {
            var start = currentExpression.length - match[ZERO].length;
            var end = currentExpression.length;
            var currentValue = Number(match[ZERO]);
            if (!isNaN(currentValue)) {
                currentValue = -currentValue;
                data = data
                    .slice(ZERO, start)
                    .concat(currentValue.toString().split(""), data.slice(end));
                screenElement.innerText = data.join("");
            }
        }
    }
}
function insertOpeningParenthesis(button) {
    if (button === "(") {
        var isOpenparenthesis = true;
        for (var i = data.length - 1; i >= ZERO; i--) {
            if (typeof data[i] === 'string' && /^\d$/.test(data[i].toString())) {
                isOpenparenthesis = false;
                break;
            }
            if (data[i] === ")") {
                isOpenparenthesis = false;
                break;
            }
            if (typeof data[i] === 'string' && operatorRegex.test(data[i].toString())) {
                break;
            }
        }
        if (isOpenparenthesis) {
            data.push("(");
        }
        screenElement.innerText = data.join("");
    }
}
function insertClosingParenthesis(button) {
    if (button === ")") {
        data.push(")");
        screenElement.innerText = data.join("");
    }
}
function handlingZeroFollowedByAdecimal(button) {
    if (Number(button) === ZERO && screenElement.innerText.startsWith(ZERO_DOT)) {
        screenElement.innerText += button;
    }
}
function removesDecimalPointIfPrecededByAnOperator(button) {
    if (operatorRegex.test(button)) {
        if (data.slice(-1)[ZERO] === ".") {
            data.pop();
        }
        button = button === "*" ? "x" : button === "/" ? "÷" : button;
        data.push(button);
        screenElement.innerText = data.join("");
    }
}
function handleNumberButton(button) {
    if (!isNaN(Number(button))) {
        screenElement.innerText = button;
        data.push(screenElement.innerText);
        screenElement.innerText = data.join("");
    }
}
function userClicksOnEqualButton(button) {
    if (button === "=") {
        try {
            var replacedArray = data.map(function (item) {
                return item === "x" ? "*" : item === "÷" ? "/" : item;
            });
            if (areYouDividingdZeroByZero(replacedArray)) {
                screenElement.innerText = "0÷0 is an invalid format. Press AC";
            }
            else {
                var result = eval(replacedArray.join(""));
                var history_1 = getHistoryFromLocalStorage();
                history_1.push(__spreadArray(__spreadArray([], replacedArray, true), ["=", result], false).join("").split(","));
                replacedArray.splice(replacedArray.length, 0, "=", result);
                displayResult(replacedArray, result);
                screenElement.innerText = !Number.isFinite(result)
                    ? "You cannot divide by zero. Press AC"
                    : result.toString();
                data = [];
                data.push(result);
                setHistoryToLocalStorage(history_1);
                createHistoryList(history_1, historyElement);
                togglesClearHistoryButton(historyElement, clearHistoryBtn);
            }
        }
        catch (e) {
            console.error(e);
            screenElement.innerText = "".concat(e.name, " press AC");
        }
    }
}
function areYouDivindingByZero(array) {
    for (var i = ZERO; i < array.length - 2; i++) {
        if (!isNaN(Number(array[i])) &&
            array[i + 1] === "/" &&
            array[i + 2] === "0") {
            return true;
        }
    }
    return false;
}
function areYouDividingdZeroByZero(array) {
    for (var i = ZERO; i < array.length - 2; i++) {
        if (array[i] === "0" && array[i + 1] === "/" && array[i + 2] === "0") {
            return true;
        }
    }
    return false;
}
function displayResult(array, outcome) {
    array = [];
    array.push(outcome);
}
function createHistoryList(entries, element) {
    element.innerHTML = "";
    entries
        .slice(-10)
        .reverse()
        .forEach(function (entry) {
        var listItem = document.createElement("li");
        listItem.textContent = entry;
        element.appendChild(listItem);
    });
}
function getHistoryFromLocalStorage() {
    return JSON.parse(localStorage.getItem("calculatorHistory") || "[]");
}
function setHistoryToLocalStorage(history) {
    localStorage.setItem("calculatorHistory", JSON.stringify(history.slice(-10)));
}
clearHistoryBtn.addEventListener("click", function () {
    historyElement.innerHTML = "";
    clearHistoryInLocalStorage();
    togglesClearHistoryButton(historyElement, clearHistoryBtn);
});
function clearHistoryInLocalStorage() {
    localStorage.removeItem("calculatorHistory");
}
function togglesClearHistoryButton(element, element2) {
    clearHistoryBtn.classList.toggle("display", element.childElementCount > 0);
}
