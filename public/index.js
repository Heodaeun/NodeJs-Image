let vertical = false;
let socket = io();

$(window).resize(isMobile);

function dropdown(button) {
    const time = parseInt(button.charAt(0));
    $(".dropdownMenuButton").html(button);
    time = isNaN(time) ? 0 : time*1000;
    socket.emit('dropdown', time);
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
    const img = new Image();
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

function dropdown(button) {
    $(".dropdownMenuButton").html(button);

    const time = parseInt(button.charAt(0));
    socket.emit('dropdown', isNaN(time) ? 0 : time*1000);
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