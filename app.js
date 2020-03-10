var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sheet = require('./data/data.json');
var cors = require('cors')

var app = express();
var server = require(`http`).Server(app);
var io = require(`socket.io`)(server);

app.use(function (req, res, next) {
    res.io = io;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/Sheet/Get', (req, res) => {

    if (!sheet) {
        res.status(400).json({ err: err });
    } else {
        res.status(200).json(sheet);
    }
})

app.post('/api/Sheet/Save', (req, res) => {

    const { row, col, value } = req.body;

    if (!sheet) {
        res.status(400);
    } else {
        sheet.Cells[row] = { ...sheet.Cells[row], [col]: value };
        io.emit('onCellSave', { row, col, value });
        res.status(200).send();

    }
});

io.on('connection', (socket) => {
    socket.on('onCellStartEditing', (data) => {
        socket.broadcast.emit('onCellStartEditing', data);
    })
});
module.exports = { app, server };
