"use strict";

console.log("search script loaded sucessfully");

let searchResults = {};

document.getElementById("search-button").addEventListener("click", function (event) {
  event.preventDefault();
  let searching = document.getElementById("search-field").value
  console.log("Searching URL:", window.location.href + "api/search/" + searching);
  $.get(window.location.href + "api/search/" + searching, function (data) {
    console.log(data);
    searchResults = data;
  })
})