let vertical = false;
let socket = io();

$(window).resize(isMobile);

function dropdown(time) {
    let name = (time==0) ? 'stop' : time + ' sec';
    $(".dropdownMenuButton").html(name);
    socket.emit('dropdown', time*1000);
}

function isMobile() {
    $(".catImage").css(isVertical(),
        matchMedia("screen and (max-width:480px)").matches 
            ? '250px'   // Mobile version
            : '450px'   // PC version
    );
}

function isVertical() {
    return vertical == true ? 'height': 'width';
}
function resizeImage(imgFiles, current){
    let img = new Image();
    img.src = './images/' + imgFiles[current];
    const width = img.width;
    const height = img.height;

    vertical = (height >= width ? true : false);
    isMobile();
    return img;
}

function displayInfo(current, total, imgFiles) {
    const img = resizeImage(imgFiles, current);
    $('.catImage').attr("src", img.src);
    $('.pages').text(current+1 + '/' + total);
}

socket.on('image_display', (current, total, imgFiles) => {
    displayInfo(current, total, imgFiles);
});

$(".backbtn").on('click', () => {
    socket.emit('button', 0);
});

$(".nextbtn").on('click', () => {
    socket.emit('button', 1);
});