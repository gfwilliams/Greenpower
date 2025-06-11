Greenpower Jolt.js v2
=======================

This uses a LoRa (long range) radio attached to Jolt.js in the car, and one attached to a laptop at the side of the track (avoiding the need for mobile reception).

Run the Reciever code: https://gfwilliams.github.io/Greenpower/v2

[Click here to upload Jolt.js code](https://www.espruino.com/ide/?codeurl=https://raw.githubusercontent.com/gfwilliams/Greenpower/refs/heads/main/v2/joltjs.js) - ensure
upload type is set to `Flash` (not `RAM`)

It requires:

* A [Jolt.js](https://www.espruino.com/Jolt.js) set up as shown in http://github.com/gfwilliams/Greenpower
* A [Bangle.js 2](https://www.espruino.com/Bangle.js)
* A Laptop with an HC-14 LoRa radio attached to a USB-Serial converter

**Note:** Right now the LoRa modules are configured on channel 28, speed 4 (`AT+C028`, `AT+S3` with the `KEY` pin pulled low)

More info on HC-14: https://wolles-elektronikkiste.de/en/hc-14-the-simple-lora-module

A webpage on a laptop can then receive data from the Jolt directly (without a phone needed)

* `index.html` is the page to run on a laptop to allow the data to be seen
* `joltjs.js` is the code that needs to be written to Jolt.js (to Flash!)
* `banglejs.js` is the code that needs to be written to Bangle.js, but this is included in the Jolt.js code and uploaded automatically
