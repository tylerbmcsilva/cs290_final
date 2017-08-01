

function main(id){
  var entry = document.getElementById(id);
  
  var header = document.createElement('h1');
  var headerText = document.createTextNode("Workout Tracker");

  header.appendChild(headerText);
  console.log(header);
  entry.appendChild(header);
};

(function(id){ 
  document.addEventListener("load", main(id));
})('app');

