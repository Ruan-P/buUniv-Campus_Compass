const $apibtn = document.getElementsByName("#api save");

const fs = require("fs");

let onClickApi = () => {
  const $apiKeys = document.getElementsByName("#maps_api");
  const jsonString = JSON.stringify($apiKeys);

  fs.writeFile("student.json", jsonString, (err) => {
    if (err) throw err;
    console.log("JSON 데이터가 파일에 저장되었습니다.");
  });
};

$apibtn.addEventListener("click", onClickApi);
