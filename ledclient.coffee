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
            level: 'debug',
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

nnl = "\r\n"

socket = new net.Socket
socket.connected = false

class Renderer extends events.EventEmitter
    constructor: ->
        #Current state of renderer (busy with drawing?)
        @busy = false

        #The canvas for the g3d2 to draw on
        @canvas = new Canvas 72, 32

        #Holds the curent buffer for the wall
        @wallBuffer = new Buffer @canvas.width * @canvas.height

        #message list of xmmpp messages queued (and to be rendered)
        @msg_list = []

    queue: (from, msg, stanza) ->
        logger.info "Starting Renderer::queue"
        logger.debug from
        logger.debug msg
        sender = from.split("/")[1]
        sender ?= "channel"
        sender = sender.trim()
        sender += ":"
        time = new Date().toTimeString().split ":"
        time = "#{time[0]}:#{time[1]}".trim()

        message = [time, sender, msg.trim()]

        @msg_list.push message

        @emit 'new_message'

    drawMsg: ->
        logger.debug "Starting Renderer::drawMsg"
        @draw @msg_list.shift()

    draw: ([time, sender, msg]) ->
        @busy = true

        #The context of the canvas
        context = @canvas.getContext '2d'
        context.fillStyle = '#ffffff'

          
        logger.debug "Starting Renderer::draw"
        msg_width = context.measureText(msg).width

        #Position of first char of message
        msg_x = @canvas.width

        @interval_id = makeInterval 42, =>
            context.clearRect 0, 0, @canvas.width, @canvas.height
            context.font = '8px Impact'
            context.fillText time, 0, 8
            context.fillText sender, 25, 8

            context.font = '12px Impact'
            context.fillText msg, msg_x, 24

            --msg_x

            imageData = context.getImageData(0, 0, @canvas.width, @canvas.height).data
            
            for i in [0..@wallBuffer.length-1]
                @wallBuffer[i] = toHex(imageData[i*4+3],1).charCodeAt 0

            logger.protocol "Wall buffer is #{@wallBuffer}"
            logger.protocol "led wall connection is #{socket.connected}"
            if socket.connected is true
                logger.protocol "03#{@wallBuffer.toString('ascii')}#{nnl}"
                socket.write "03#{@wallBuffer.toString('ascii')}#{nnl}"

            if msg_x <= -msg_width - 1
                clearInterval @interval_id
                @busy = false 
                logger.debug "Message drawing done"
                @emit 'done'

renderer = new Renderer

toHex = (n, l) ->
    n = n.toString 16
    while n.length < l
        n = "0"+n
    return n

fs.readFile './config', 'utf-8', (err, data) ->
    logger.info "Reading configuration File"
    return logger.error err if err?
    config = JSON.parse(data)

    logger.debug "Jid: #{config.jid}"
    logger.debug "Password: #{config.password}"
    logger.debug "Muc: #{config.muc}"

    logger.info "Connecting with xmpp"
    jid = config.jid
    password = config.password
    client = new xmppClient.Client {jid, password}, ->
            client.addListener 'online', ->
                logger.info "Online"
            #Communicating directly with the client does not work at the moment
            client.addListener 'message', (from, msg, stanza) ->
                renderer.queue from, msg, stanza
            #Communication inside the muc
            client.room config.muc, (status) ->
                logger.debug "entered muc with status #{status}"
##TO BE TESTED
                @addListener 'message', (from, msg, stanza) ->
                    renderer.queue from, msg, stanza
    logger.info "Connecting with wall server" 
    logger.debug "Wallport " + config.wallport
    logger.debug "Wallserver " + config.wallserver
    socket.connect config.wallport,config.wallserver, ->
        socket.connected = true
        lvl = '03'
        socket.write "04#{lvl}#{nnl}"
        socket.write "00#{nnl}"
        logger.info "wallserver connected"

    socket.on 'data', (data) ->
        return logger.error data if data == 'bad'
        logger.protocol data
    socket.on 'error', (data) ->
        logger.error data
    socket.on 'close', (data) ->
        logger.info "wallserver closing connection"
        socket.connected = false

    renderer.on 'new_message', ->
        logger.debug "Renderer reacting on signal new_message"
        if not @busy
            @drawMsg() 

    renderer.on 'done', ->
        logger.debug "Renderer reacting on signal done"
        unless @msg_list.length is 0
            @drawMsg()
        else
            socket.write "02FFFF00#{nnl}"
