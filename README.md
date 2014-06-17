Browserevent (only works with WebdriverJS > v2.0.0)
============

This is an experimental feature that helps you to listen on events within the browser. It
is currently **only** supported in Chrome browser (other browser will eventually follow).
To register an event call the `addEventListener` command. If an event gets invoked it returns
almost the complete event object that got caught within the browser. Only the `Window` will
be removed to avoid circular references. All objects from type `HTMLElement` will be
replaced by their xPath. This will help you to query and identify this element with WebdriverJS.

## Install

First install this plugin via NPM by executing

```sh
$ npm install browserevent
```

Then just require the module and enhance your client object.

```
var client = require('webdriverio').remote({ desiredCapabilities: { browserName: 'chrome' } }),
	browserevent = require('browserevent');

// by passing the client object as argument the module enhances it with
// the `addEventListener` and `removeEventListener` command
browserevent.init(client);
```

## Usage

After that you can use `addEventListener` to register events on one or multiple elements
and `removeEventListener` to remove them.

**Example**

```js
client
    .url('http://google.com')
    .addEventListener('dblclick','#hplogo', function(e) {
        console.log(e.target); // -> 'id("hplogo")'
        console.log(e.type); // -> 'dblclick'
        console.log(e.clientX, e.clientY); // -> 239 524
    })
    .doubleClick('#hplogo') // triggers event
    .end();
```

**Note:** this is still an experimental feature. Some events like `hover` will not be
recorded by the browser. But events like `click`, `doubleClick` or custom events are working flawlessly.