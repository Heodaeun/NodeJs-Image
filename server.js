const express = require('express');
const fs = require('fs');
const readline = require('readline');
const rl = readline.Interface({
    input: process.stdin,
    output: process.stdout,
});

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

function clickButton(num) { // num: 0(auto) 1(back) 2(next)
    if(num !== 0) { // 타이머가 실행 중이 아닌 경우
        stop(); // 타이머가 실행 중일 수 있으므로 타이머를 중지시킴
    }
    if(num === 1) { // back button
        console.log('Execute the back button.');
        if(current === 0) { // 첫 페이지인 경우
            return console.log('This is the first page.');
        }
        current -= 1;
    } else { // 타이머 실행 중이거나 next button 인 경우
        console.log('Execute the next button.');
        if (current+1 === total) { // 현재 페이지가 마지막 페이지인 경우
            stop(); // 타이머 정지
            return console.log('This is the last page.');
        }
        current += 1;
    }
    console.log(`page: ${current+1}/${total}`);
    io.emit('image_display', current, total, imgFiles);
}

function setTime(time) { // auto 기능 실행
    console.log(`set auto time ${time/1000} sec`);
    if(time === 0) { // stop을 한 경우
        return stop();
    }
    if (timerId !== null) {
        if (timerId._destroyed === false) { // 타이머 실행 중인 경우
            return timerId._repeat = time;
        }
    } // 타이머가 실행 중이 아닌 경우
    timerId = setInterval( () => clickButton(0), time);
}

function stop() {
    clearInterval(timerId);
}

function watchImage(){
    fs.watch('./public/images', async (event, files) => {
        console.log('The type of change was: ', event, ", file: ", files);
        await readFile();
        io.emit('image_display', current, total, imgFiles);
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

function readLine() {
    rl.on('line', (line) => {
        if(line == 'back') {
            return clickButton(1);
        }else if(line == 'next') {
            return clickButton(2);
        }else if(line == 'stop') {
            return stop();
        }else if(line.slice(0,4) == 'auto') {
            const time = Number(line.slice(4, line.length));
            if (isNaN(time) === false) {
                setTime(time * 1000);
            }
        }
    });
}

readFile();

const io = require('socket.io')(server); 
io.on('connection',  (socket) => {
    console.log(`user connected : ${socket.id}`);    
    io.emit('image_display', current, total, imgFiles);

    readLine();
    watchImage();

    socket.on('button', (num) => {
        clickButton(num);
    });
    socket.on('dropdown', (time) => {
        setTime(time);
    });
    socket.on('disconnect', () => {
        console.log(`user disconnected : ${socket.id}`);
    });
});
