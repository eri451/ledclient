// TODO: aufräumen
var fs = require("fs")
, util = require("util")
, events = require("events")
, net = require("net")
, winston = require("winston")
, Canvas = require("canvas")
    , can = new Canvas(72, 32)
    , ctx = can.getContext('2d')
, xmppClient = require("xmpp-client");

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'warn' }),
      new (winston.transports.File)({ filename: 'ledclient.log' })
    ]
});

logger.info("blie bla blub");

var nnl = "\r\n"            // network new line
, config
, client
, queue = []
, socket = new net.Socket();

socket.connected = false;
ctx.fillStyle = '#ffffff';

var Renderer = function () {};
util.inherits(Renderer, events.EventEmitter);
var renderer = new Renderer();

Renderer.prototype.busy = false;

Renderer.prototype.queue =  function (from, msg, stanza){
        var sender
            , message;
        sender  = (from.split("/")[1] === undefined)? "channel" :
            from.split("/")[1];
        sender = sender.trim();
        time = new Date().toTimeString().split(":");
        time = time[0] +":"+ time[1];
        time = time.trim();
        msg = msg.trim();

        message = [time ,sender +":", msg];
        queue.push(message);
        logger.info(queue);
        if (!this.busy){
            this.emit('go');
        }
}

Renderer.prototype.drawMsg = function (canvas, message){
    context = canvas.getContext('2d');
    var timeWidth = context.measureText(message[0]).width;
    var sndWidth = context.measureText(message[1]).width;
    var msgWidth = context.measureText(message[2]).width;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var msgx = canvas.width;
//    var  sndx = 0;
//    var count = 1;

    var self = this;
    var id = setInterval( function () {

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.font = '8px Impact';
        context.fillText( message[0], 0, 8);
        context.fillText( message[1], 25, 8);

        context.font = '12px Impact';
        context.fillText( message[2], msgx, 24);
//        sndx += count;
        msgx --;
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        var wallBuffer = new Buffer(canvas.width * canvas.height);

        for (var i = 0; i < canvas.width * canvas.height; i++){
            wallBuffer[i] = toHex(imageData[i*4 + 3], 1).charCodeAt(0);
        }
        if (socket.connected === true){
            socket.write("03" + wallBuffer.toString('ascii') + nnl);
        }
//        if (sndx <= 0){
//            count = -count;
//        }
//        if (sndx > canvas.width - sndWidth){
//            count = -count;
//        }
        if (msgx <= -msgWidth - 1){
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
        logger.info("Client connected");
        logger.info(config.jid);
        logger.info(config.password);
        logger.info(config.muc);
        client.addListener('online',function (){
            console.log("online");
        });
        // due to xmpp-client no pm possible
/*        client.addListener('message', function(from, msg, stanza) {
            logger.info("" + from +  msg + " to im");
            renderer.queue(from, msg, stanza);
        });*/
        client.room(config.muc, function (status){
            console.log(status);
            this.addListener('message', function(from, msg, stanza) {
                renderer.queue(from, msg, stanza);
                logger.info("" + from +  msg +" to room");
            });
        });
    });
}

renderer.on('done', function (){
    if (queue.length != 0){
        renderer.drawMsg(can, queue.shift());
    }else{
        renderer.drawMsg(can, [" "," "," "]);
    }
});
renderer.on('go', function (){
    renderer.drawMsg(can, queue.shift());
    renderer.busy = true;
});

readConf( function (err, data){
    if (err){
        return console.log(err);
    }
    config = data;
    console.log(config.jid);
    connect(client);
    socket.connect( config.wallport, config.wallserver, function (){
        socket.connected = true;
        socket.write("00" + nnl);
        console.log("Wall connected");
        setPriority(3);
    });
    socket.on("data",function (data){
       logger.info(data);
    });
    socket.on("error", function (data){
        console.error(data);
    });
    socket.on("close", function (data){
        console.log("wall connection closed");
        socket.connected = false;
    });
});
