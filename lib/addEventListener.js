/**
 * `this` refers to the EventHandler object of the WebdriverIO instance
 * `that` refers to the Browserevent instance
 */

var addEventListener = module.exports = function(that) {

    return function(eventName,elem,callback,useCapture) {

        // console.log('socket da?', !!that.socket, Object.keys(that.socket));
        if(!that.socket) {
            // try again after 100ms
            return setTimeout(this.addEventListener.bind(this,eventName,elem,callback,useCapture), 100);
        }

        // store registered event to be able to remove listener
        if(!that.browserEvents[eventName + '-' + elem]) {
            that.browserEvents[eventName + '-' + elem] = [];

            // register event on client side
            that.socket.emit('addEventListener', {
                eventName: eventName,
                elem: elem,
                useCapture: useCapture || false
            });
        }
        that.browserEvents[eventName + '-' + elem].push(callback.toString());

        // register event on server side
        that.socket.on(eventName + '-' + elem, function() {
            callback.apply(arguments);
        });

    };

};