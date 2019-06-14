'use strict';
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const RegNumManager = require('./registration_number_manager');
const RegNumListRoutes = require('./routes/reg-num-list-routes');

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
const regNumListRoutes = RegNumListRoutes(regNumManager);

app.use(session({
    secret: 'yikes',
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

app.get('/', regNumListRoutes.index);

app.post('/regdata', regNumListRoutes.addNewReg);

app.post('/clear', regNumListRoutes.clear);

const PORT = process.env.PORT || 3012;

app.listen(PORT, function () {
    console.log('app started at port: ' + PORT);
});
