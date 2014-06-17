/**
 * Browserevent
 */

var fs = require('fs'),
    http = require('http'),
    socketio = require('socket.io'),
    addEventListener = require('./addEventListener'),
    removeEventListener = require('./removeEventListener');

var BrowserEvent = module.exports.init = function(webdriverInstance) {

    var that = this;

    if (!webdriverInstance) {
        throw new Error('A WebdriverJS instance is needed to initialise browserevent');
    }

    this.browserEvents = {};

    /**
     * initialize socket connection
     */
    this.app = http.createServer();
    this.io  = socketio.listen(this.app, { log: false });
    this.app.listen(5555);

    this.io.sockets.on('connection', function (socket) {
        that.socket = socket;
    });

    /**
     * read crx extension and add it as desiredCapability
     */
    this.crx = fs.readFileSync('./extensions/chrome.crx').toString('base64');

    if (!webdriverInstance.desiredCapabilities.chromeOptions) {
        webdriverInstance.desiredCapabilities.chromeOptions = {};
    }
    if (!webdriverInstance.desiredCapabilities.chromeOptions.extensions || Object.prototype.toString.call(webdriverInstance.desiredCapabilities.chromeOptions.extensions) !== '[object Array]') {
        webdriverInstance.desiredCapabilities.chromeOptions.extensions = [];
    }
    webdriverInstance.desiredCapabilities.chromeOptions.extensions.push(this.crx);

    /**
     * enhance instance eventhandler
     */
    webdriverInstance.eventHandler.addEventListener = addEventListener(this);
    webdriverInstance.eventHandler.removeEventListener = removeEventListener(this);

    /**
     * register commands
     */
    ['addEventListener', 'removeEventListener'].forEach(webdriverInstance.eventHandler.registerCommands.bind(webdriverInstance.eventHandler));

    return this;

};