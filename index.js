'use strict';
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const RegNumManager = require('./registration_number_manager');

const app = express();

const pg = require('pg');
const Pool = pg.Pool;

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/registration_nums';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});

const regNumManager = RegNumManager(pool);

app.use(session({
    secret: 'secret message',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

const handlebarSetup = exphbs({
    partialsDir: './views',
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get('/', async function (req, res) {
    // eslint-disable-next-line camelcase
    let reg_num_list = await regNumManager.buildRegNumList();
    res.render('index', {
        reg_num_list
    });
});

app.post('/regdata', async function (req, res) {
    let newReg = req.body.regFieldText;
    await regNumManager.addReg(newReg);
    req.flash('error', regNumManager.error());
    res.redirect('/');
});

app.post('/clear', async function (req, res) {
    await regNumManager.clearTable();
    res.redirect('/');
});

const PORT = process.env.PORT || 3012;

app.listen(PORT, function () {
    console.log('app started at port: ' + PORT);
});
