var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dbConfig = require('./config.js'); 

var db = mysql.createPool(dbConfig);

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});



app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 50791);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index');
});

// Get all workouts
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

// Create 1 workout
app.post('/workouts',function(req,res,next){
  var context = {};
  var wo = req.body;
  wo.date = new Date().toISOString();
  console.log(wo.date);
  db.query("INSERT INTO workouts SET ?",wo, function(err, result){
    if(err){
      next(err);
      return;
    }
    context.id = result.insertId; 
    res.send(JSON.stringify(context));
  });
});

// Get 1 workout
app.get('/workouts/:id',function(req,res,next){
  db.query("SELECT * FROM workouts where id = ?", req.params.id,function(err, result){
    if(err){
      next(err);
      return;
    }
    res.send(JSON.stringify(result[0]));
  });
});

// Update 1 workout
app.put('/workouts/:id', function(req,res,next){
  var context = {};
  db.query("UPDATE workouts SET name=?, reps=?, weight=?, lbs=? where id=?",
  [ req.body.name,
    parseInt(req.body.reps),
    parseInt(req.body.weight),
    parseInt(req.body.lbs),
    parseInt(req.params.id)], function(err, result){
      if(err){
        next(err);
        return;
      }
      context.success = true;
      res.send(JSON.stringify(context));
  });
});

// Delete 1 workout
app.delete('/workouts/:id', function(req,res,next){
  var context = {};
  db.query("DELETE FROM workouts WHERE id=?",req.params.id, function(err, result){
      if(err){
        next(err);
        return;
      }
      context.success = true;
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
