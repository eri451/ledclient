var net = require("net");
var Canvas = require("canvas")
    , can = new Canvas(72, 32)
    , ctx = can.getContext('2d');

var xmppClient = require("xmpp-client");

var nnl = "\r\n";           // network new line


var socket = new net.Socket();

socket.connected = false;

socket.on("data",function (data){
    //console.log(data.toString());
});
socket.on("error", function (data){
    console.error(data);
});
socket.on("close", function (data){
    console.log("connection closed");
    socket.connected = false;
});

var toHex = function (n, l){
    n = n.toString(16);
    while (n.length < l){
        n = "0"+n
    }
    return n
}

var setPixel = function (x, y, b){
    x = toHex(x, 2);
    y = toHex(y, 2);
    b = toHex(b, 1);

    if (socket.connected){
        socket.write("02"+ x + y + b + nnl);
//        console.log("02"+ x + y + b + nnl);
    }
}

var setAll = function (b){
    b = toHex(b, 1);

    if (socket.connected){
        socket.write("02ffff"+ b + nnl);
//        console.log("02ffff"+ b + nnl);
    }
}

var setPriority = function (lvl){
    lvl = toHex(lvl, 2);
    if (socket.connected){
        socket.write("04" + lvl + nnl);
    }
}

var blink = function (times, hi_brightnes, lo_brightness, delay, callback){
    var id;
    times *= 2;
    id = setInterval( function (){
        if (--times % 2){
            setAll(hi_brightnes)
        }else{
            setAll(lo_brightness);
        }
        if (times === 0){
            clearInterval(id);
            callback();
        }
    }, delay );
}

var renderer = {

    render:  function (canvas){
        context = canvas.getContext('2d');
        setInterval( function (){
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    //        console.log(imageData);
            var wallBuffer = new Buffer(canvas.width * canvas.height);
            for (var i = 0; i < canvas.width * canvas.height; i++){
    //            console.log(toHex(imageData[i*4 +1]/16,1).charCodeAt(0));
                wallBuffer[i] = toHex(imageData[i*4 + 3], 1).charCodeAt(0);
            }
            if (socket.connected === true){
                socket.write("03" + wallBuffer.toString('ascii') + nnl);
    //            console.log("03" + wallBuffer.toString('ascii') + nnl );
    //            console.log(wallBuffer);
            }
        },
        1000);  // frames per second
    }
    , pushMsg: function (canvas, message){
        context = canvas.getContext('2d');
        var width = ctx.measureText(message).width;
        var _ = width > canvas.width;
        switch (_){
            case (_ == true):{
                context.clearRect(0, 0, canvas.width, canvas.height);
                var y = width;
                var id = setInterval( function () {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.fillText( message, width - y*2, 21);
                    y--;
                    var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
                    var wallBuffer = new Buffer(canvas. width * canvas.height);

                    for (var i = 0; i < canvas.width * canvas.height; i++){
                        wallBuffer[i] = toHex(imageData[i*4 + 3], 1).charCodeAt(0);
                    }
                    if (socket.connected === true){
                        socket.write("03" + wallBuffer.toString('ascii') + nnl);
                    }
                    if (y == 0){
                         clearInterval(id);
                    }
                 },100);
                 break;
             }
             case (_ = false):{
                 context.clearRect(0, 0, canvas.width, canvas.heigh);
                 context.fillText( message, (width - canvas.width)/2, 21);
                 break;
             }
         }
     }
};


var c = new xmppClient.Client({
    jid: 'g3d2bot@hq.c3d2.de',
    password: 'g3d2bot',
}, function () {
    console.log("client connected");
    c.addListener('online',function (){
        console.log("online");
    });
    c.addListener('message', function(stanza) {
        console.log(stanza.getChild('body').getText().toString());
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
//        console.log(from;
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
//        console.log(msg);
            console.log(stanza);
    });
    c.room("eri_is_learning@muc.hq.c3d2.de", function (status){
        console.log(status);
        this.addListener('message', function(from, msg, stanza) {
            console.log("--------------------------------------------------");
            console.log(from);
            console.log("--------------------------------------------------");
            console.log(msg);
            ctx.clearRect(0,0,can.width,can.height);
            var width = ctx.measureText(msg).width;
            renderer.pushMsg(can, msg);
        });
    });
});



ctx.font = '12px Impact';
ctx.fillStyle = '#ffffff';
//var imageData = ctx.getImageData(0, 0, context.width, context.height).data;
//console.log('<img src="' + can.toDataURL() + '" />');

//console.log(can.width);

socket.connect(1339, "localhost", function (){
    socket.connected = true;
    console.log("connected");
    socket.write("00" + nnl);
    renderer.render(can);
});

