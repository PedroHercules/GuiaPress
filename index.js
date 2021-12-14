const express = require('express');
const session = require('express-session');
const connection = require('./database/database');
const categoriesController = require('./categories/categoriesController');
const articlesController = require('./articles/articlesController');
const usersController = require('./user/userController');
const Article = require('./articles/Article');
const Category = require('./categories/Category');
const User = require('./user/User');

const app = express();

//View engine
app.set('view engine', 'ejs');

//sessions

app.use(session({
    secret: "dsgdjhsgdgsdggshjdghjgdhjgshdgjhsd",
    cookie: {maxAge: 3000000}
}));

// static 
app.use(express.static('public'));

//url encoded express
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//database
connection
    .authenticate()
    .then(() =>{
        console.log('Success connection with DB');
    }).catch(err => {
        console.log(err);
    });


app.use('/', articlesController);
app.use('/', categoriesController);
app.use('/', usersController);

app.get('/', (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then( articles => {
        Category.findAll().then(categories => {
            res.render('home', {articles: articles, categories: categories});
        }); 
    });
});

app.get('/:slug', (req, res) => {
    let slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined){
            Category.findAll().then(categories => {
                res.render('article', {article: article, categories: categories});
            }); 
        }else{
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});

app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if (category != undefined){
            Category.findAll().then(categories => {
                res.render('home', {articles: category.articles, categories: categories});
            })
        }else{
            res.redirect('/');
        }
    }).catch(err => {
        res.redirect('/');
    });
});

app.listen(3333, () => {
    console.log('Server is running');
});