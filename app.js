const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const app = express();

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

var port = process.env.PORT_NUMBER;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000, // 1hry
    }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload()); // configure fileupload
const webRouter = require('./routes/web/index');
const apiRouter = require('./routes/api/index');
app.use ((req, res, next) => {
    res.locals.url = req.originalUrl;
    var current_url = req.originalUrl.split("/");
    res.locals.main_module = (current_url[1])?current_url[1]:'';
    res.locals.child_module = (current_url[2])?current_url[2]:'';
    next();
});
app.use('/',webRouter);
app.use('/api',apiRouter);



app.use((err, req, res, next) => {
    console.log(err);
    return res.send('Internal Server Error'+err);
});
app.listen(port, () => console.log('Server is runngin on port '+port));
