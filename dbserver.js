// server.js

    // set up ========================
    const express  = require('express');
    var app      = express();                               // create our app w/ express
    const bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    const redis = require('redis');
    const mysql = require('mysql');
    const test = require('./test.json');
    // configuration =================

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    //redis dbs
    var redismaster = redis.createClient(6379, 'redis-master');
    var redisslave = redis.createClient(6379, 'redis-slave');

    //check connection to redis master and slave
    redismaster.on('ready', function() {
        console.log('master connected');
    });

    redisslave.on('ready', function() {
        console.log('slave connected');
    });

    // check connection to mysql db
    var mysqlConn = mysql.createConnection({
      host: "localhost:3306",
      user: "user",
      password: "lepassword"
    });

    mysqlConn.connect(function(err) {
      if (err) console.log(err);
      console.log("Connected!");
    });

    let temp = test[0]._id;
    for(i in test) {
      redismaster.lpush('jobs', JSON.stringify(test[i]));
      if(temp < test[i]._id) { temp = test[i]._id; }
    }
    console.log(temp)
    redismaster.set('counter', temp);
      

    // routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/db/:tableName', (req, res) => {
      client.exists(req.params.tableName, function(err, reply) {
        if (reply === 1) {
          console.log('exists');
        } else {
          
        }
      });


        redisslave.lrange(req.params.tableName, 0, 100, function(err, reply) {
            console.log(reply);
            res.json(reply);
        });
    });

    // create todo and send back all todos after creation
    app.post('/db/:tableName', (req, res) => {
        redismaster.incr(req.params.tableName + '_counter', (err, currCounter) => {
            redismaster.hmset('jobs', currCounter, req.body.text, () => {
                redismaster.hgetall('jobs', (err, info) => {
                    console.log(info);
                    res.json(info); 
                });
            });
        });
        
    });

    // // delete a todo
    // app.delete('/api/todos/:todo_id', function(req, res) {
    //     console.log(req.params.todo_id);
    //     redismaster.hdel('todos', req.params.todo_id,  function() {
    //         redismaster.hgetall('todos', function(err, info) {
    //             console.log(info);
    //             res.json(info); 
    //         });
    //     });
    // });

    // // application -------------------------------------------------------------
    // app.get('*', function(req, res) {
    //     res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    // });

    // app.get('/game', function(req,res) {
    //     res.sendFile('./public/')
    // });

    // listen (start app with node server.js) ======================================
    app.listen(8383);
    console.log("App listening on port 8383");