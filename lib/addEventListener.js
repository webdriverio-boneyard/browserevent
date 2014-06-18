/**
 * `this` refers to the Browserevent instance
 */

var addEventListener = module.exports = function(eventName,elem,callback,useCapture) {

    // store registered event to be able to remove listener
    if(!this.browserEvents[eventName + '-' + elem]) {
        this.browserEvents[eventName + '-' + elem] = [];

        // register event on client side
        this.socket.emit('addEventListener', {
            eventName: eventName,
            elem: elem,
            useCapture: useCapture || false
        });
    }
    this.browserEvents[eventName + '-' + elem].push(callback.toString());

    // register event on server side
    this.socket.on(eventName + '-' + elem, callback);

};