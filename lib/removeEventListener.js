/**
 * `this` refers to the EventHandler object of the WebdriverIO instance
 * `that` refers to the Browserevent instance
 */

var addEventListener = module.exports = function(that) {

    return function(eventName,elem,callback,useCapture) {

        if(!that.socket) {
            // try again after 100ms
            return setTimeout(that.removeEventListener.bind(this,eventName,elem,callback,useCapture), 100);
        } else if(!that.browserEvents[eventName + '-' + elem] || !that.browserEvents[eventName + '-' + elem].length) {
            return this;
        }

        // get stored event listener
        that.browserEvents[eventName + '-' + elem].forEach(function(listener, i) {
            if(listener === callback.toString()) {
                // remove listener in event list
                that.browserEvents[eventName + '-' + elem].splice(i,1);

                // remove listener on server side
                that.socket.removeListener(eventName + '-' + elem,callback);

                // break loop
                return false;
            }
        });

        // remove event listener on client side if there is no listener anymore
        if(that.browserEvents[eventName + '-' + elem].length === 0) {
            that.socket.emit('removeEventListener', {
                eventName: eventName,
                elem: elem,
                useCapture: useCapture || false
            });
        }

    };

};