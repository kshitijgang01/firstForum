const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mongoDBstore = require('connect-mongodb-session')(session);
const app = express();
const postHandler = require('./models/posts');
const userHandler  = require('./models/users');

const store = new mongoDBstore({
    uri:"mongodb+srv://senna:Topa@123@cluster0.lje24.mongodb.net/proj1?retryWrites=true&w=majority",
    collection : 'sessions'
})



app.set('view engine' ,'ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(session({secret:"mySecretLOL",resave:false,saveUninitialized:false,store:store,cookie: {expires: new Date(253402300000000)} }));
app.use((req,res,next)=>{
    res.locals.isLoggedin = req.session.isLoggedin || false;
    next();
})




app.get('/login',(req,res,next)=>{
    res.render('login');
})


app.post('/login',userHandler.login);





app.get('/register',(req,res,next)=>{
    res.render('registration',{message:''})
})

app.post('/register',(req,res,next)=>{
    if(req.session.isLoggedin){
        res.redirect('/showPost')
    }
    const username = req.body.shownName;
    const email = req.body.username;
    const password = req.body.passw;
    userHandler.findUser(email,(user)=>{
        if(!user){
        userHandler.saveUser(email,password,username,()=>{
        res.redirect('/addPost');
        })
        }
        else{
            res.render('registration',{message:"user already registered"})
        }
    })


    
})

app.use('/logout',(req,res,next)=>{
    req.session.destroy(err=>{
        console.error(err);
    })
    res.redirect('addPost');
})





app.get('/addPost',(req,res,next)=>{
    if(!req.session.isLoggedin){
        return res.redirect('/login');
    }
    console.log(req.session.isLoggedin);
    res.render('form');
});

app.post('/addPost',(req,res,next)=>{
    const user = req.session.user.username;
    const title = req.body.headline;
    const story = req.body.story;
    postHandler.save(title,story,user,()=>res.redirect('/addPost'));
});

app.get('/post/:postId',(req,res,next)=>{
    const id = req.params.postId;
    postHandler.disOne(id,(data)=>{
        
        res.render('showOne',{data:data});
    })
    
})

app.get('/showPost',(req,res,next)=>{
    const page = +req.query.page || 1;

    
    
    postHandler.dis(page,(data,page,nums)=>{
        const prevPage = +page-1;
        const nextPage = +page+1;
        const numPages = Math.ceil(nums/10);
        res.render('show',{data:data,currentPage:page,prevPage:prevPage,nextPage:nextPage,numPages:numPages});
    })
});


app.post('/addComment',(req,res,next)=>{
    if(!req.session.isLoggedin){
        return res.redirect('/login');
    }
    const idPost = req.body.postId;
    const comment = req.body.comm;
    console.log(idPost);
    console.log(comment);
    postHandler.addComm(idPost,comment,()=>{
        res.redirect('/post/'+idPost);
    });
})
app.post('/upvote',(req,res,next)=>{
    const idPost = req.body.postId;
    console.log(idPost);
    postHandler.upvote(idPost,()=>{
        res.status(200).json({"message":'success',});
    });
    
})
app.post('/downvote',(req,res,next)=>{
    const idPost = req.body.postId;
    console.log(idPost);
    postHandler.downvote(idPost,()=>{
        res.status(200).json({"message":'success',});
    })
    
})





app.listen(8080);



//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





