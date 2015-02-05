var assert = require('assert'),
    webdriverio = require('webdriverio'),
    browserevent = require('../index.js'),
    client;

describe('test client side events', function() {

    before(function(done) {

        client = webdriverio.remote({
            port: 4445,
            user: process.env.SAUCE_USERNAME,
            key: process.env.SAUCE_ACCESS_KEY,
            logLevel: 'verbose',
            desiredCapabilities: {
                browserName: 'chrome',
                platform: 'OS X 10.6',
                version: 35,
                name: 'BrowserEvent plugin test'
            }
        });

        browserevent.init(client);
        client.init().url('http://webdriverjs.christian-bromann.com').call(done);

    });

    var keyCharacter = 't',
        keyType = 'keyup',
        keyPressTestDone = false,
        keypressListenerTest = function(e) {

            // test event values
            assert.strictEqual(e.keyIdentifier, 'U+0054'); // U+0054 === 't'
            assert.strictEqual(e.type, keyType);

            client
                .getValue(e.target, function(err,res) {
                    assert.strictEqual(res,keyCharacter);
                })
                // set flag to test if event was fired in L44
                .call(function() {
                    keyPressTestDone = true;
                });
        };

    it('should be register/remove keypress event listener', function(done){

        client

            // register event browser listener
            .addEventListener(keyType,'.searchinput',keypressListenerTest.bind(this))

            // focus input
            .click('.searchinput')

            // type key character - listener should be invoked
            .keys(keyCharacter)
            .pause(3000)

            .call(function() {
                // check if keypressListenerTest was executed and event was catched
                // should be because event callback should be fired
                assert.ok(keyPressTestDone);
            })

            // remove listener
            .removeEventListener(keyType,'.searchinput',keypressListenerTest.bind(this))

            // type another character and check if listener gets executed again
            // no listener should get executed otherwise L14 would cause AssertionError
            .addValue('.searchinput','o')

            .call(done);

    });

    after(function(done) {
        client.end(done);
    });

});