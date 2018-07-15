var express = require("express");
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');

var Posts = require('./schema/posts');
var Comments = require('./schema/comments');

var port = process.env.port || 3001;


app.use(express.static(__dirname + "/public" ));
app.set('view engine', 'ejs');

app.use(bodyParser.json());


app.get('/',function(req,res){
    Posts.find({}, function(err, posts) {
        if (err) {
          console.log(err);
        } else {
          res.render('index', { posts: posts });
        }
    });
});


app.post('/postdetails',function(req,res){
    console.log('body',req.body)



    var posts = new Posts({ id:req.body.postid,title: req.body.title, description: req.body.description, url: req.body.url,by:"Surajit"});

    posts.save(function (err, p) {
  	  if (err) return console.error(err);
  	  console.log(p.title + " saved to bookstore collection.");
  	});


})


app.get('/posts/detail/:id',function(req,res){
    Posts.findById(req.params.id, function (err, postDetail) {
        if (err) {
          console.log(err);
        } else {
            Comments.find({'postId':req.params.id}, function (err, comments) {
                res.render('post-detail', { postDetail: postDetail, comments: comments, postId: req.params.id });
            });
        }
    });
});


// DB connection
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/posts_db', { useMongoClient: true })
.then(() => console.log('connection succesful'))
.catch((err) => console.error(err));
// DB connection end


io.on('connection',function(socket){
    socket.on('comment',function(data){
        var commentData = new Comments(data);
        commentData.save();
        socket.broadcast.emit('comment',data);
    });

});

http.listen(port,function(){
console.log("Server running at port "+ port);
});
