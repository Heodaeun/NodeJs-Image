const express = require('express');

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index');
});

const server = app.listen(app.get('port'), () => {
    console.log(`Application Running: http://localhost:${server.address().port}`);
});

const io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
    })
});
