let currSelected;
let lastSelected;
let selectedTool = null;
let lastSave = null;

const work = document.querySelector("#svg");
const myAlert = document.querySelector(".alert");
const next = document.querySelector(".next");

const vertex = document.querySelector(".vertex");
const edge = document.querySelector(".edge");
const path = document.querySelector(".path");

const modeSwitcher = document.querySelector(".curr-mode");
const modeElem = document.querySelector(".mode-tool");

const toolPanel = document.querySelector(".stack-tool");
let isAction = false;

const weightWindow = function (EorP) {

    let form  = document.createElement("div");
    form.className = "form-wrap";
    form.innerHTML = 
    `
        <form class="weight-form">
            <label class="form-title" for="weight">${EorP instanceof E ? "Вес Ребра" : "Вес Дуги"}</label>
            <input id="weight" class="input-number" type="number" value="${EorP.value}">
            <button type="submit" class="submit">Ок</button>
        </form>
    `;

    const input = form.querySelector("#weight");

    input.ondblclick = () => {
        input.value = "";
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        EorP.setValue(Number(input.value));
        form.remove();
    }

    document.body.append(form);
}