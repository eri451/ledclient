fs  = require "fs"
console.log fs
util = require "util"
events = require "events"
net = require "net"
Canvas = require "canvas"
xmppClient = require "xmpp-client"
winston = require "winston"

myLevels =
    levels: 
      protocol: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    ,
    colors: 
      protocol: 'grey',
      debug: 'blue',
      info: 'green',
      warn: 'yellow',
      error: 'red'

logger = new (winston.Logger) (
    levels: myLevels.levels
    transports: [
        new (winston.transports.Console)( 
            level: 'protocol',
            colorize: 'true'
        )
        new (winston.transports.File)(
            filename: 'ledclient_coffee.log',
            colorize: 'true'
        )
    ]
)

winston.addColors myLevels.colors


logger.protocol "protocol output"
logger.debug "debug output"
logger.info "info output"
logger.warn "warn output"
logger.error "error output"
# make setInterval less painful
makeInterval = (ms, callback) ->
    setInterval callback, ms

can = new Canvas 72, 32
ctx = can.getContext '2d'

nnl = "\r\n"
queue = []

socket = new net.Socket

socket.connected = false
ctx.fillStyle = '#ffffff'

class Renderer extends events.EventEmitter
    constructor: ->
        @busy = false
#        @on => switch event
#            when 'go'
#                @busy = true
#                @drawMsg can, queue.shift()
#            when 'done'
#                @busy = true
#                @drawMsg can, [" "," "," "]

    queue: (from, msg, stanza) ->
        logger.info "Starting Renderer::queue"
        logger.debug from
        sender = from.split("/")[1]
        sender ?= "channel"
        sender = sender.trim()
        sender += ":"
        logger.debug sender
        time = new Date().toTimeString().split ":"
        time = "#{time[0]}:#{time[1]}".trim()

        message = [time, sender, msg.trim()]

        queue.push message

        @emit 'go' if not @busy

    drawMsg: (canvas, message) ->
        logger.debug message
        context = canvas.getContext '2d'
        [time_w, sender_w, msg_w] = for entry in message
            context.measureText(entry).width
        msg_x = canvas.width

        @interval_id = makeInterval 42, =>
            context.clearRect 0, 0, canvas.width, canvas.height

            context.font = '8px Impact'
            context.fillText message[0], 0, 8
            context.fillText message[1], 25, 8

            context.font = '12px Impact'
            context.fillText message[2], msg_x, 24

            --msg_x

            imageData = context.getImageData(0, 0, canvas.width, canvas.height).data
            wallBuffer = new Buffer canvas.width * canvas.height

            for i in wallBuffer
                wallBuffer[i] = toHex(imageData[i*4 + 3],1).charCodeAt 0

            logger.protocol "led wall connection is #{socket.connected}"
            if socket.connected is true
                socket.write "03 #{wallBuffer.toString('ascii')} + nnl"

            if msg_x <= -msg_w - 1
                clearInterval @interval_id
                @emit 'done'

renderer = new Renderer
readConf = (callback) ->
    console.log fs
    fs.readFile './config', 'utf-8', (err, data) ->
        if err?
            callback err
        else
            callback null, JSON.parse(data)

toHex = (n, l) ->
    n = n.toString 16
    while n.length < l
        n = "0"+n
    return n

setAll = (b) ->
    b = toHex b, 1
    socket.write "02ffff" + b + nnl if socket.connected

setPriority = (lvl) ->
    lvl = toHex lvl, 2
    socket.write "04" + lvl + nnl if socket.connected

connect_client = ({jid, password, muc}) ->
    client = new xmppClient.Client {jid, password}, ->
            console.log "client connected"
            client.addListener 'online', ->
                console.log "online"
            client.addListener 'message', (from, msg, stanza) ->
                    renderer.queue from, msg, stanza

            client.room muc, (status) ->
                console.log status
                @addListener 'message', (from, msg, stanza) ->
                    renderer.queue from, msg, stanza

readConf (err, {jid, password, muc, wallserver, wallport}) ->
    logger.info "Starting readConf"
    return logger.error err if err?
    logger.info jid
    connect_client {jid, password, muc}
    socket.connect wallport, wallserver, ->
        socket.connected = true
        setPriority 3 
        socket.write "00" + nnl
        console.log "wall connected"

    renderer.on 'go', ->
        @busy = true
        @drawMsg can, queue.shift()

    renderer.on 'done', ->
        @busy = true
#        logger.debug(queue)
        logger.debug(queue.shift())
        if queue.length is not 0
             @drawMsg can, queue.shift()
        else
             @drawMsg can, [" "," "," "]

    socket.on 'data', (data) ->
        logger.debug data

    socket.on 'error', (data) ->
        logger.error data

    socket.on 'close', (data) ->
        logger.info "wall connected close"
        socket.connected = false
