const btns = document.querySelectorAll("[data-value]") as NodeListOf<HTMLElement>;
const historyElement = document.querySelector(".computation-history") as HTMLElement;
let screenElement = document.querySelector("[data-screen]") as HTMLElement;
const historyBtn = document.querySelector(".history-btn") as HTMLElement;
const slidingPart = document.querySelector(".sliding-part") as HTMLElement;
const computationHistoryParent = document.querySelector(".computation-history-parent") as HTMLElement;
const operators = document.querySelectorAll("[data-operator]") as NodeListOf<HTMLElement>;
const clearHistoryBtn = document.querySelector(".clear-history-btn") as HTMLElement;
let currentExpression: string | number;

const operatorRegex = /[\/*\-+]/;
const ZERO = 0;
const ZERO_DOT = "0.";
const HISTORY_LIMIT = 10;
const history2: string[][] = [];

let data: (string | number)[] = [];

clearHistoryBtn.addEventListener("click", () => {
  historyElement.innerHTML = "";
});

document.addEventListener("keydown", handleKeyPress);

window.addEventListener("DOMContentLoaded", () => {
  const history = getHistoryFromLocalStorage();
  createHistoryList(history, historyElement);
});

function handleKeyPress(event: KeyboardEvent): void {
  const key = event.key;
  const button = document.querySelector(`[data-value="${key}"]`) as HTMLElement;
  if (button) {
    button.click();
  }

  if (event.code === "Backspace") {
    let newArray = data.slice(ZERO, -1);
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

historyBtn.addEventListener("click", () => {
  slidingPart.classList.toggle("slide");
  computationHistoryParent.classList.toggle("visility");
});

btns.forEach((btn) => {
  btn.addEventListener("click", function (e: Event) {
    let buttonValue = (e.target as HTMLElement).dataset.value as string;

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

function convertToPercentage(button: string): void {
  if (button === "%") {
    currentExpression = data.join('');
    currentExpression = Number(currentExpression) / 100;
    data = [currentExpression];
    screenElement.innerText = currentExpression.toString();
  }
}

function deteLastEntry(button: string): void {
  if (button === "DE") {
    let newArray = data.slice(ZERO, -1);
    screenElement.innerText = newArray.join("");
    data = newArray;
    if (screenElement.innerText === "") {
        screenElement.innerText = ZERO.toString();
    }
  }
}

function canUserAddDot(button: string): void {
  if (button === ".") {
    let dotAllowed = true;
    for (let i = data.length - 1; i >= ZERO; i--) {
      if (data[i] === ".") {
        dotAllowed = false;
        break;
      } else if (typeof data[i] === 'string' && operatorRegex.test(data[i].toString())) {
        break;
      }
    }
    if (dotAllowed) {
      if (data.length == ZERO) {
        data.push("0");
      } else if (typeof data[data.length - 1] === 'string' && operatorRegex.test(data[data.length - 1].toString())) {
        data.push("0");
      }
      data.push(".");
    }
    screenElement.innerText = data.join("");
  }
}

function deleteEverythingFromScreen(button: string): void {
  if (button === "AC") {
    screenElement.innerText = "";
    data = [];
    screenElement.innerText = ZERO.toString();
  }
}

function toggleSign(button: string): void {
  if (button === "minus") {
    currentExpression = data.join("");
    let reversedExpression = currentExpression.split("").join("");
    let match = reversedExpression.match(/(\d+(\.\d+)?)|(\D+)/);

    if (match) {
      let start = currentExpression.length - match[ZERO].length;
      let end = currentExpression.length;
      let currentValue = Number(match[ZERO]);

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

function insertOpeningParenthesis(button: string): void {
  if (button === "(") {
    let isOpenparenthesis = true;
    for (let i = data.length - 1; i >= ZERO; i--) {
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

function insertClosingParenthesis(button: string): void {
  if (button === ")") {
    data.push(")");
    screenElement.innerText = data.join("");
  }
}

function handlingZeroFollowedByAdecimal(button: string): void {
  if (Number(button) === ZERO && screenElement.innerText.startsWith(ZERO_DOT)) {
    screenElement.innerText += button;
  }
}

function removesDecimalPointIfPrecededByAnOperator(button: string): void {
  if (operatorRegex.test(button)) {
    if (data.slice(-1)[ZERO] === ".") {
      data.pop();
    }
    button = button === "*" ? "x" : button === "/" ? "÷" : button;

    data.push(button);
    screenElement.innerText = data.join("");
  }
}

function handleNumberButton(button: string): void {
  if (!isNaN(Number(button))) {
    screenElement.innerText = button;
    data.push(screenElement.innerText);
    screenElement.innerText = data.join("");
  }
}

function userClicksOnEqualButton(button: string): void {
  if (button === "=") {
    try {
      const replacedArray = data.map((item) =>
        item === "x" ? "*" : item === "÷" ? "/" : item
      );
      if (areYouDividingdZeroByZero(replacedArray)) {
        screenElement.innerText = "0÷0 is an invalid format. Press AC";
      } else {
        let result = eval(replacedArray.join(""));
        const history = getHistoryFromLocalStorage();
        history.push([...replacedArray, "=", result].join("").split(","));
        replacedArray.splice(replacedArray.length, 0, "=", result);
        displayResult(replacedArray, result);
        screenElement.innerText = !Number.isFinite(result)
          ? "You cannot divide by zero. Press AC"
          : result.toString();
        data = [];
        data.push(result);
        setHistoryToLocalStorage(history);
        createHistoryList(history, historyElement);
        togglesClearHistoryButton(historyElement, clearHistoryBtn);
      }
    } catch (e) {
      console.error(e);
      screenElement.innerText = `${(e as Error).name} press AC`;
    }
  }
}



function areYouDivindingByZero(array: (string | number)[]): boolean {
  for (let i = ZERO; i < array.length - 2; i++) {
    if (
      !isNaN(Number(array[i])) &&
      array[i + 1] === "/" &&
      array[i + 2] === "0"
    ) {
      return true;
    }
  }
  return false;
}

function areYouDividingdZeroByZero(array: (string | number)[]): boolean {
  for (let i = ZERO; i < array.length - 2; i++) {
    if (array[i] === "0" && array[i + 1] === "/" && array[i + 2] === "0") {
      return true;
    }
  }
  return false;
}

function displayResult(array: (string | number)[], outcome: number): void {
  array = [];
  array.push(outcome);
}

function createHistoryList(entries: string[], element: HTMLElement): void {
  element.innerHTML = "";
  entries
    .slice(-10)
    .reverse()
    .forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.textContent = entry;
      element.appendChild(listItem);
    });
}

function getHistoryFromLocalStorage(): string[] {
  return JSON.parse(localStorage.getItem("calculatorHistory") || "[]");
}

function setHistoryToLocalStorage(history: string[]): void {
  localStorage.setItem("calculatorHistory", JSON.stringify(history.slice(-10)));
}

clearHistoryBtn.addEventListener("click", () => {
  historyElement.innerHTML = "";
  clearHistoryInLocalStorage();
  togglesClearHistoryButton(historyElement, clearHistoryBtn);
});

function clearHistoryInLocalStorage(): void {
  localStorage.removeItem("calculatorHistory");
}

function togglesClearHistoryButton(element: HTMLElement, element2: HTMLElement): void {
  clearHistoryBtn.classList.toggle("display", element.childElementCount > 0);
}