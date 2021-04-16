const express = require('express');
const fs = require('fs');

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index');
});
const server = app.listen(app.get('port'), () => {
    console.log('Application Running: http://localhost:%d', server.address().port);
});

let current = 0;
let total, imgFiles;
let timerId = null;

function clickButton(num, s) {  //s=0:auto, s=1:button / num=0:back, num=1:next
    if(s == 1 || current+1 == total) {   //이전에 수행중인 auto 시간 제거
        stop();
        if(s == 0) return false; //auto에서 마지막페이지일 경우 끝냄
    }
    if(num==1){
        if(current+1 != total) {
            current += 1;
            io.emit('image_display', current, total, imgFiles);
        }
    } else {
        if(current != 0) {
            current -= 1;
            io.emit('image_display', current, total, imgFiles);
        }
    }
    console.log(`client clicked ${num ?'next':'back'} button. (${current+1}/${total})`);
}

function setTime(time) {
    console.log(`set auto time ${time/1000} sec`);
    if(time == 0) {
        stop();
    } else {
        timerId = setInterval(() => clickButton(1, 0), time);
    }
}

function stop() {
    clearInterval(timerId);
}

function watchImage(){
    fs.watch('./public/images', async (event, files) => {
        try {
            console.log('The type of change was: ', event, ", file: ", files);
            await readFile();
            io.emit('image_display', current, total, imgFiles);
        } catch (err) {
            console.error(err);
        }
    });
}

function readFile(){
    return new Promise((resolve, reject) => {
        fs.readdir('./public/images', (err, files) => {
            if(err) return console.error(err);
            imgFiles = files;
            total = files.length;
            resolve();
        });
    });
};

readFile();

const io = require('socket.io')(server); 
io.on('connection',  (socket) => {
    console.log(`user connected : ${socket.id}`);    
    io.emit('image_display', current, total, imgFiles);

    watchImage();

    socket.on('button', (num) => {
        clickButton(num, 1);
    });
    
    socket.on('dropdown', (time) => {
        setTime(time);
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected : ${socket.id}`);
    });
});
