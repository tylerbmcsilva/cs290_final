
function ajax(){
    // PRIVATE FUNCTIONS
    function urlifyParameters(obj){
        if(!Object.keys(obj).length) return "";
        var keys = Object.keys(obj);
        var result = []
        for(var i = 0; i < keys.length; i++){
            result.push(keys[i] + "=" + obj[keys[i]]);
        }
        return "?" + result.join("&");
    }
    function response(req,callback){
        return callback({
            status: req.status,
            statusText: req.statusText,
            response: req.response,
            responseURL: req.responseURL,
            responseText: req.responseText
        });
    }

    // PUBLIC FUNCTIONS
    function GET(url, parameters, callback){
        console.log(parameters)
        var req = new XMLHttpRequest();
        req.open("GET", url + urlifyParameters(parameters), true);
        req.addEventListener("load", function(){
            response(req,callback);
        });
        req.send(null);
    }
    function POST(url, parameters, callback){
        var req = new XMLHttpRequest();
        var params = urlifyParameters(parameters);
        req.open("POST", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.addEventListener("load", function(){
            response(req,callback);
        });
        req.send(params);
    }

    return {
        get: GET,
        post: POST
    }
}

function main(id){
  var a = ajax();
  
  var entry = document.getElementById(id);
  
  var header = document.createElement('h1');
  var headerText = document.createTextNode("Workout Tracker");

  header.appendChild(headerText);
  entry.appendChild(header);

  a.get("/workouts",{},function(res){
    console.log(JSON.parse(res.response));
  });
};

(function(id){ 
  document.addEventListener("load", main(id));
})('app');

