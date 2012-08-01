// TODO: aufräumen
var fs = require("fs")
, util = require("util")
, events = require("events")
, net = require("net")
, Canvas = require("canvas")
    , can = new Canvas(72, 32)
    , ctx = can.getContext('2d')
, xmppClient = require("xmpp-client");

var nnl = "\r\n"            // network new line
, config
, client
, queue = []
, socket = new net.Socket();
socket.connected = false;

var Renderer = function () {};
util.inherits(Renderer, events.EventEmitter);
var renderer = new Renderer();

Renderer.prototype.busy = false;

Renderer.prototype.queue =  function (from, msg, stanza){
        var sender
            , message;
        sender  = (from.split("/")[1] === undefined)? "channel" :
            from.split("/")[1];
        message = sender +": "+ msg;
        queue.push(message);
        if (!this.busy){
            this.emit('go');
        }
}

Renderer.prototype.drawMsg = function (canvas, message){
    context = canvas.getContext('2d');
    var width = ctx.measureText(message).width;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var y = canvas.width;
    var self = this;
    var id = setInterval( function () {
//                log(from, msg, stanza, 'room');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText( message, y, 21);
        y --;
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        var wallBuffer = new Buffer(canvas.width * canvas.height);

        for (var i = 0; i < canvas.width * canvas.height; i++){
            wallBuffer[i] = toHex(imageData[i*4 + 3], 1).charCodeAt(0);
        }
        if (socket.connected === true){
            socket.write("03" + wallBuffer.toString('ascii') + nnl);
        }
        if (y <= width*(-1)){
             clearInterval(id);
             self.emit('done');
        }
     },42);
}

var readConf = function(callback){
    fs.readFile('./config', 'utf-8', function (err, data){
        if (err){
            return callback(err);
        }
        callback(null, JSON.parse(data));
    });
}

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
    }
}

var setAll = function (b){
    b = toHex(b, 1);

    if (socket.connected){
        socket.write("02ffff"+ b + nnl);
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


var log = function (from, msg, stanza, listener ){
    switch (listener){
        case 'client':
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
            console.log(from);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
            console.log(msg);
            break;
       case 'room':
            console.log("--------------------------------------------------");
            console.log(from);
            console.log("--------------------------------------------------");
            console.log(msg);
            break;
       default:
            console.log("mist");
    }
}

var connect = function (client){
    client = new xmppClient.Client({
        jid: config.jid,
        password: config.password,
    }, function () {
        console.log("Client connected");
        client.addListener('online',function (){
            console.log("online");
        });
        client.addListener('message', function(from, msg, stanza) {
            log(from, msg, stanza, 'client');
            renderer.queue(from, msg, stanza);
        });
        client.room(config.room, function (status){
            console.log(status);
            this.addListener('message', function(from, msg, stanza) {
                renderer.queue(from, msg, stanza);
            });
        });
    });
}

renderer.on('done', function (){
    if (queue.length != 0){
        renderer.drawMsg(can, queue.shift());
    }else{
        renderer.busy = false;
    }
});
renderer.on('go', function (){
    console.log(queue);
    renderer.busy = true;
    renderer.drawMsg(can, queue.shift());
});
ctx.font = '12px Impact';
ctx.fillStyle = '#ffffff';

readConf( function (err, data){
    if (err){
        return console.log(err);
    }
    config = data;
    console.log(config.jid);
    connect(client);
    socket.connect( config.wallport, config.wallserver, function (){
        socket.connected = true;
        console.log("Wall connected");
        socket.write("00" + nnl);
    });
    socket.on("data",function (data){
    });
    socket.on("error", function (data){
        console.error(data);
    });
    socket.on("close", function (data){
        console.log("connection closed");
        socket.connected = false;
    });
});
