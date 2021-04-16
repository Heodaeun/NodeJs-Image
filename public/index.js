let vertical = false;
let socket = io();

function isVertical() {
    return vertical == true ? 'height': 'width';
}
    
function resizeImage(imgFiles, current) {
    var img = new Image();
    img.src = './images/' + imgFiles[current];
    var width = img.width;
    var height = img.height;

    vertical = (height >= width ? true : false);
    $(".catImage").css(isVertical(), '450px');
    return img;
}
    
function displayInfo(current, total, imgFiles) { 
    var img = resizeImage(imgFiles, current);
    $('.catImage').attr("src", img.src);
    $('.pages').text(`${current+1} / ${total}`);
}

function dropdown(button) {
    $(".dropdownMenuButton").html(button);

    var time = parseInt(button.charAt(0));
    time = isNaN(time) ? 0 : time*1000;
    socket.emit('dropdown', time);
}

socket.on('image_display', function(current, total, imgFiles) {
    displayInfo(current, total, imgFiles);
});

$(".backbtn").on('click', (e) => {
    socket.emit('button', 0);
});

$(".nextbtn").on('click', (e) => {
    socket.emit('button', 1);
});