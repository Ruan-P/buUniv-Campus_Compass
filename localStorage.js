const $apibtn = document.querySelector("button #api_save");
const apiData = document.getElementById("maps_api");

// let fs = require("fs");

const LOCAL_DATA = "";

let onClickApi = () => {
  console.log("click");
  localStorage.setItem(LOCAL_DATA, apiData.value);
};
