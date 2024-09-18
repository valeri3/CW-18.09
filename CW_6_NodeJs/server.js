var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/news', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/news.html'));
});

app.get('/about', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/submit-login', function(req, res) {
    const { login, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;

        const users = JSON.parse(data);
        const user = users.find(u => u.login === login && u.password === password);

        if (user) {
            res.redirect(`/login?message=success&login=${login}`);
        } else {
            res.redirect('/login?message=error');
        }
    });
});

app.get('/register', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.post('/submit-register', function(req, res) {
    const { login, password, confirmPassword, email } = req.body;

    if (password === confirmPassword) {
        const newUser = { login, password, email };

        fs.readFile('users.json', 'utf8', (err, data) => {
            if (err) {
                return res.redirect('/register?message=error');
            }

            const users = JSON.parse(data);

            const userExists = users.some(u => u.login === login);
            const emailExists = users.some(u => u.email === email);

            if (userExists) {
                res.redirect('/register?message=exists');
            } else if (emailExists) {
                res.redirect('/register?message=email_exists');
            } else {
                users.push(newUser);

                fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
                    if (err) throw err;
                    res.redirect('/register?message=success');
                });
            }
        });
    } else {
        res.redirect('/register?message=mismatch');
    }
});

app.use(function(req, res) {
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(8080, function() {
    console.log('Server running on port 8080');
});
