const express = require('express');
const router = express.Router();
const User = require('./User');
const bcrypt = require('bcryptjs');
const {Op} = require('sequelize')

router.get('/admin/users', (req, res) => {

    User.findAll().then(users => {
        res.render('admin/users/home', {users: users});
    })
});

router.get('/admin/users/create', (req, res) => {
    res.render('admin/users/create');
});

router.post('/users/create', (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    User.find

    User.findOne({where:{ [Op.or]: [{username: username}, {email: email}]}}).then(user => {
        if (user == undefined) {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt); 
            User.create({
                username: username,
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/');
            }).catch(err => {
                res.redirect('/');
            });
        } else {
            res.redirect('/admin/users/create')
        }
    })
});

router.get('/login', (req, res) => {
    res.render('admin/users/login');
});

router.post('/authenticate', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.findOne({where: {username: username}}).then( user => {
        if(user != undefined) {
            let correct = bcrypt.compareSync(password, user.password);
            if(correct){
                req.session.user = {
                    id: user.id,
                    usersame: user.username,
                    email: user.email
                }
                res.redirect('/admin/articles');
            }else{
                res.redirect('/login');
            }
        }else{
            res.redirect('/login');
        }
    })
});

router.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
})


module.exports = router;