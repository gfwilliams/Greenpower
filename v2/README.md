Greenpower Jolt.js v2
=======================

This uses a LoRa (long range) radio attached to Jolt.js in the car, and one attached to a laptop at the side of the track (avoiding the need for mobile reception).

Run the Reciever code: [https://gfwilliams.github.io/Greenpower/v2](https://gfwilliams.github.io/Greenpower/v2)

[Click here to upload Jolt.js code](https://www.espruino.com/ide/?codeurl=https://raw.githubusercontent.com/gfwilliams/Greenpower/refs/heads/main/v2/joltjs.js) - ensure
upload type is set to `Flash` (not `RAM`)

Pre-Usage
----------

* Install the Jolt.js is charged - turn it on and plug into USB-C
* Install the Bangle.js is charged
* Go to [https://banglejs.com/apps/?id=assistedgps](https://banglejs.com/apps/?id=assistedgps), connect to the Bangle.js and upload AGPS data in the previous 24 hours to the race (this helps the Bangle get a GPS fix way quicker)
* Ensure the correct drivers for the USB-Serial are installed on the laptop (check Device Manager - possibly https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers?tab=downloads is needed)
* You probably want to pre-load [https://gfwilliams.github.io/Greenpower/v2](https://gfwilliams.github.io/Greenpower/v2) on the Laptop in case there's no internet

Usage
-----

* Put the Bangle.js in range of the Jolt.js
* Turn on the Jolt.js (switch is on the radio board)
  * it should flash red,red,purple
  * After a few seconds the Bangle should start showing a status display
* Plug the radio receiver into a Laptop
* Go to [https://gfwilliams.github.io/Greenpower/v2](https://gfwilliams.github.io/Greenpower/v2)
* Click connect (top left), choose the COM port for the radio receiver, and then `Connect`
  * `Age` should show a number up to `3s` as data packets are sent every 3 seconds
  * `Data Log` counts up - this is the data from the Jolt.js that's stored on the laptop - clear it before a race and save it after (although it should remember if the webpage gets closed).

Requirements
------------

* A [Jolt.js](https://www.espruino.com/Jolt.js) set up as shown in http://github.com/gfwilliams/Greenpower
* A [Bangle.js 2](https://www.espruino.com/Bangle.js)
* A Laptop with an HC-14 LoRa radio attached to a USB-Serial converter

**Note:** Right now the LoRa modules are configured on channel 28, speed 4 (`AT+C028`, `AT+S3` with the `KEY` pin pulled low)

More info on HC-14: https://wolles-elektronikkiste.de/en/hc-14-the-simple-lora-module

A webpage on a laptop can then receive data from the Jolt directly (without a phone needed)

* `index.html` is the page to run on a laptop to allow the data to be seen
* `joltjs.js` is the code that needs to be written to Jolt.js (to Flash!)
* `banglejs.js` is the code that needs to be written to Bangle.js, but this is included in the Jolt.js code and uploaded automatically
