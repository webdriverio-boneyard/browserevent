/**
 * Browserevent
 * Plugin for the WebdriverIO project to listen on client side browser events
 *
 * @author Christian Bromann <mail@christian-bromann.com>
 * @license Licensed under the MIT license.
 */

module.exports = process.env.WEBDRIVERCSS_COVERAGE === '1' ? require('./lib-cov/browserevent.js') : require('./lib/browserevent.js');