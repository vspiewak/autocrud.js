/* 

curl -v -H "Content-type: application/json" -X POST -d ' { "author": "john doe","content": "hello :)" }'  http://localhost:3000/api/posts
curl -v -H "Content-type: application/json" -X PUT -d ' { "author": "john doe", "content": "hello everyponies :)" }' http://localhost:3000/api/posts/3
curl -v -X DELETE http://localhost:3000/api/posts/3

*/
var DATAS_FILE = "datas.json";

var seq = 3;
var datas = {

    "posts" :
    {
       "1" : {
            id: "1",
            author: "john doe",
            content: "My first post"
            
        },
       "2" : {
            id: "2",
            author: "john doe",
            content: "My second post"
        },
          
    }
};



var express = require('express')
    , fs = require('fs')
    , app = express();

app.configure(function () {
    app.use(express.bodyParser());
});

app.use(express.static(__dirname));

/*
app.get('/api/save', function(req, res) {

    var serialized = JSON.stringify({ "seq": seq, "datas": datas });
    fs.writeFileSync(DATAS_FILE, serialized, 'utf8', function(err) {
        if(err) {
            res.status(500).send({ message: "Error during persistence: " + err });
        } else {
            res.send({ message: "objects persisted" });
        }
    }); 
    
});


app.get('/api/load', function(req, res) {

    fs.readFileSync(DATAS_FILE, 'utf8', function (err, data) {
      if (err) {
        res.status(500).send({ message: "Error during persistence: " + err });
      }

      data = JSON.parse(data);
      seq = data.seq;
      res.send({ message: "object persisted" });

    });
});
*/

/*
 * GET - list of datas
 */
app.get('/api/:model', function(req, res) {
    var model = req.params.model;
    var models = datas[model];

    if(models) res.send(models);   
   
    res.status(404).send({ message: 'Not found' });
   
});

app.get('/api', function(req, res) {
    res.send(datas);
});

/*
 * GET - an element
 */
app.get('/api/:model/:id', function(req, res) {

    var model = req.params.model;
    var id = req.params.id;
    var ret = datas[model];
    if(datas[model][id]) res.send(ret[id]);

    res.status(404).send({ message: 'Not found' });
});

/*
 * POST - create an element
 */
app.post('/api/:model', function(req, res) {
   
    var model = req.params.model;
    var obj = req.body;

    if (!datas[model]) {
        datas[model] = {};    
    }
    obj.id = seq;
    datas[model][seq] = obj;
    seq++;
    res.send(obj);

});

/*
 * PUT - update an element (replace, no field update)
 */
app.put('/api/:model/:id', function(req, res) {

    var model = req.params.model;
    var id = req.params.id;
    var obj = req.body;
    var ret = datas[model];

    if(ret[id]) {
        obj.id = parseInt(id, 10); //nice try son ;)
        ret[id] = obj;
        res.send(obj);
    } 
    res.status(404).send({ message: 'Not Found' });
});

/*
 * DELETE - delete an element
 */
app.delete('/api/:model/:id', function(req, res) {
   
    var model = req.params.model;
    var id = req.params.id;
    var ret = datas[model];

    if(ret[id]) {
        var obj = ret[id];
        delete ret[id];
        res.send(obj);
    }

    res.status(404).send({ message: 'Not Found' });
});

app.listen(3000);
console.log('Listening on port 3000...');