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