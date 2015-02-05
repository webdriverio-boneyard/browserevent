/**
 * Browserevent
 */

var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    socketio = require('socket.io'),
    addEventListener = require('./addEventListener'),
    removeEventListener = require('./removeEventListener');

var BrowserEvent = module.exports.init = function(webdriverInstance) {

    var that = this;

    if (!webdriverInstance) {
        throw new Error('A WebdriverIO instance is needed to initialise browserevent');
    }

    this.browserEvents = {};

    /**
     * initialize socket connection
     */
    this.app = http.createServer();
    this.io  = socketio.listen(this.app);
    this.app.listen(5555, '0.0.0.0');

    this.io.sockets.on('connection', function (socket) {
        that.socket = socket;
    });

    /**
     * read crx extension and add it as desiredCapability
     */
    this.crx = fs.readFileSync(path.join(__dirname, '..', 'extensions/chrome.crx')).toString('base64');

    if (!webdriverInstance.desiredCapabilities.chromeOptions) {
        webdriverInstance.desiredCapabilities.chromeOptions = {};
    }
    if (!webdriverInstance.desiredCapabilities.chromeOptions.extensions || Object.prototype.toString.call(webdriverInstance.desiredCapabilities.chromeOptions.extensions) !== '[object Array]') {
        webdriverInstance.desiredCapabilities.chromeOptions.extensions = [];
    }
    webdriverInstance.desiredCapabilities.chromeOptions.extensions.push(this.crx);

    /**
     * enhance webdriverio eventhandler
     * this needs to be done with the trick that we've already used in the WebdriverIO EventHandler
     * see https://github.com/webdriverio/webdriverio/blob/master/lib/utils/EventHandler.js#L32 for
     * more informations
     *
     * but this time we need to tweak the trick a bit to ensure that the socket request gets send
     * after a socket connection was established
     */
    webdriverInstance.addEventListener = function() {

        var args = arguments,
            isConnected = false;

        webdriverInstance.addCommand('__addEventListener', function(done) {

            /**
             * if socket connection was already established go ahead and
             * register event
             */
            if(that.socket) {
                addEventListener.apply(that, Array.prototype.slice.call(args));
                return done();
            }

            /**
             * if not, wait until we receive a vital sign form the client browser
             */
            that.io.sockets.on('connection', function (socket) {
                that.socket = socket;
                addEventListener.apply(that, Array.prototype.slice.call(args));
                isConnected = true;
                done();
            });

            setTimeout(function() {
                if(isConnected) {
                    return;
                }

                throw new Error('can\'t establish socket connection')
            }, 30000)

        });

        /**
         * execute custom command immediately
         */
        webdriverInstance.__addEventListener();

        /**
         * remove custom command to avoid a possible double execution
         */
        webdriverInstance.__addEventListener = undefined;

        /**
         * return "this" to make commands chainable
         */
        return webdriverInstance;

    };

    /**
     * register removeEventListener the traditional way
     */
    webdriverInstance.eventHandler.removeEventListener = removeEventListener(this);
    webdriverInstance.eventHandler.registerCommands('removeEventListener');

    return this;

};