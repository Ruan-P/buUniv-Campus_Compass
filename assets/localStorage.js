//@Author 박선준
let saveAPI = () => {
  // API Data -> LocalStorage / API 데이터 저장 기능 구현
  const { value } = document.getElementById("maps_api");
  localStorage.setItem("key", value);
  console.log(localStorage.getItem("key"));
};

let rmAPI = () => {
  // API Data Clear 기능
  let apiData = localStorage.getItem("key");
  localStorage.removeItem("key");
  console.log(`removed API DATA : ${apiData}`);
};
