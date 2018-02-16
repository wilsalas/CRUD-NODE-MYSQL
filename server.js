const express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server).sockets,
    exphbs = require('express-handlebars'),
    mysql = require('mysql'),
    bodyParser = require("body-parser");
/*------------------------------------------------------------------------------------------------------------------*/
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'node_mysql'
});
/*------------------------------------------------------------------------------------------------------------------*/
db.connect(err => {
    if (err) {
        console.log('Error Mysql Connect');
        throw err;
    }
    console.log('Connected Mysql');
});
/*------------------------------------------------------------------------------------------------------------------*/
app.set('port', process.env.PORT || 3000);
server.listen(app.get('port'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('.hbs', exphbs({
    defaultLayout: '',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
/*------------------------------------------------------------------------------------------------------------------*/
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome To App SS' });
});
app.post('/post', (req, res) => {
    res.json(req.body)
})
/*------------------------------------------------------------------------------------------------------------------*/
io.on('connection', socket => {
    /*------------------------------------------------------------------------------------------------------------------*/
    app.post('/save', (req, res) => {
        var data =
            {
                title: req.body.title,
                body: req.body.message,
                status: 'active'
            }
        if (req.body.title !== '' && req.body.message !== '') {
            db.query('insert into posts set ?', data, (err, result) => {
                if (err) {
                    throw err;
                }
                io.emit('getall', [data]);
            });
        }
        else {
            res.json({ type: 'info', message: 'Plase enter values' })
        }

    });
    /*------------------------------------------------------------------------------------------------------------------*/
    app.post('/update', (req, res) => {
        if (req.body.id !== 'undefined') {
            db.query(`update posts set status = '${req.body.status}' where id=${req.body.id}`, (err, result) => {
                if (err) {
                    throw err;
                }
                res.json({ reload: true });
            });
        }
        else {
            res.json({ reload: false, type: 'error', message: 'Problem to update' });
        }
    });
    /*------------------------------------------------------------------------------------------------------------------*/
    //`select * from posts where id= ${req.body.title}`
    db.query(`select * from posts where status='active' order by id asc`, (err, results, fields) => {
        if (err) {
            throw err;
        }
        if (results.length !== 0) {
            socket.emit('getall', results);
        }
    });
    /*------------------------------------------------------------------------------------------------------------------*/
    socket.on('deletes', () => {
        db.query('delete from posts', (err, result) => {
            if (err) {
                throw err;
            }
            io.emit('reload_page', { type: 'warning', message: 'Messages deletes', clear: true });
        });
    });
    /*------------------------------------------------------------------------------------------------------------------*/
    socket.on('MessageRealTime', data => {
        io.emit('previewMessage',{message:data.message})
    })

});

