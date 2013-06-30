/* 

curl -v -H "Content-type: application/json" -X POST -d ' { "author": "john doe","content": "hello :)" }'  http://localhost:3000/api/posts
curl -v -H "Content-type: application/json" -X PUT -d ' { "author": "john doe", "content": "hello everyponies :)" }' http://localhost:3000/api/posts/3
curl -v -H "Content-type: application/json" -X PUT -d '[ { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" } ]' http://localhost:3000/api/posts
curl -v -H "Content-type: application/json" -X PUT -d '[ { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" }, { "author": "john doe", "content": "hello everyponies :)" } ]' http://localhost:3000/api/posts
curl -v -X DELETE http://localhost:3000/api/posts/3
curl -v -X DELETE http://localhost:3000/api/posts

curl -v -H "Content-type: application/json" -X PUT -d '[ { "name": "lassie", "colors": [ "yellow", "grey" ] }, { "name": "moon moon", "colors": [ "white" ] } ]' http://localhost:3000/api/dogs

http://localhost:3000/api/posts/1/?fields=author,content
http://localhost:3000/api/posts/?fields=content,author
http://localhost:3000/api/posts/?author=john doe&fields=id,content
http://localhost:3000/api/posts?offset=3&limit=6

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
    , app = express()
    , fs = require('fs')
    , url = require('url');

app.configure(function () {
    app.use(express.bodyParser());
});

app.use(express.static(__dirname));


function trimObjectField(item, fields){
    var obj = {};
    fields.forEach(function(field) {
        obj[field] = item[field];
    });
    return obj;
}


function filterFields(req, values) {

    var queryObject = url.parse(req.url,true).query;
    var keys = Object.keys(queryObject);
    var fields = (queryObject.fields && queryObject.fields.split(",")) || [];
    
    if(fields.length > 0) {
    
        if(!(values instanceof Array)) {
            values = trimObjectField(values, fields);
        } else {
            var ret = [];
            values.forEach(function(item) {      
                ret.push(trimObjectField(item, fields));
            });
            values = ret;
        } 
    }

    return values;
}


function filterQuery(req, values) {

    var queryObject = url.parse(req.url,true).query;
    var keys = Object.keys(queryObject);
    var ret = values.slice();

    //fields is dedicated for partials response & pagination
    var idx = keys.indexOf("fields");
    if(idx != -1) keys.splice(idx, 1);
    idx = keys.indexOf("offset");
    if(idx != -1) keys.splice(idx, 1);
    idx = keys.indexOf("limit");
    if(idx != -1) keys.splice(idx, 1);

    values.forEach(function(value) {
        keys.forEach(function(key) {
            if(value[key] != queryObject[key]) {
                ret.pop(value);
            }
        });
    });

    return ret;
}


function filterPagination(req, values) {
    var query = url.parse(req.url,true).query;
    if(query.limit && query.offset) {
        var limit = parseInt(query.limit);    
        var offset = parseInt(query.offset);
        values.splice(0, offset);
        values.splice(limit, values.length - limit);
    }
    return values;
}


/*
 * GET - retrieve all values api
 */ 
app.get('/api', function(req, res) {
    res.send(datas);
});

/*
 * GET - list of datas
 */
app.get('/api/:model', function(req, res) {

    var models = datas[req.params.model];

    if(models) {
        var values = [];
        for(key in models) { 
            values.push(models[key]);
        }

        values = filterQuery(req, values);
        values = filterPagination(req, values);
        values = filterFields(req, values);
        res.send(values);   
    
    } 
    res.status(404).send({ message: 'Not found' });
   
});

/*
 * GET - an element
 */
app.get('/api/:model/:id', function(req, res) {

    var model = req.params.model;
    var id = req.params.id;
    var value = datas[model][id];

    if(value) {
        var value = filterFields(req, value);
        res.send(value);
    } 
    res.status(404).send({ message: 'Not found' });
});

/*
 * GET - an element association
 */
app.get('/api/:model/:id/:association', function(req, res) {

    var model = req.params.model;
    var id = req.params.id;
    var association = req.params.association;
    var obj = datas[model][id];

    if(obj && obj[association]) 
        res.send(obj[association]);

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
 * PUT - bulk update all elements (replace)
 */
app.put('/api/:model', function(req, res) {

    var model = req.params.model;
    var objects = req.body;

    datas[model] = {};

    objects.forEach(function(item) {
        item.id = seq;
        seq++;
        datas[model][item.id] = item;
    });

    res.send(datas[model]);
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
 * DELETE - delete all elements
 */
app.delete('/api/:model', function(req, res) {
   
    var model = req.params.model;
    var ret = datas[model];

    if(ret) {
        delete datas[model];
        res.send(ret);
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
