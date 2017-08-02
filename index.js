var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dbConfig = require('./config.js'); 

var db = mysql.createPool(dbConfig);

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

// HELPER FUNCTION TO CREATE RANODOM IDS
// https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
}



app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 12017);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index');
});

app.get('/workouts',function(req,res,next){
  var context = {};
  db.query("SELECT * FROM workouts", function(err, result){
    if(err){
      next(err);
      return;
    }

    res.send(JSON.stringify(result));
  });
});

app.post('/workouts',function(req,res,next){
  var context = {};
  var wo = req.body;
  wo.id = guidGenerator();
  wo.date = new Date().toISOString().slice(0, 10);
  console.log(wo);
  db.query("INSERT INTO workouts SET ?",wo, function(err, result){
      if(err){
        next(err);
        return;
      }
      console.log(result)
      context.id = result.insertId; 
      res.send(JSON.stringify(context));
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  db.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    db.query(createString, function(err){
      context.results = "Table reset";
      res.render('index',context);
    })
  });
});

app.get('*', function(req,res){
  res.redirect('/');
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
