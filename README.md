Greenpower receiver
===================

https://gfwilliams.github.io/Greenpower/

## Wiring

* Wire up a [Jolt.js](https://www.espruino.com/Jolt.js):

```
JST => Connect to a LiPo battery
Q0 => battery voltage
 sda (blue)   : Potential divider to GND and capacitor from Battery 1 V+ (link wire between batteries)
 scl (yellow) : Potential divider to GND and capacitor from Battery 2 V+ (main 24v voltage)
 gnd (black) : Fan negative
Q1 => battery amps cable
 sda (blue)   : 10k resistor to one side of GND wire from battery to motor controller
 scl (yellow) : 10k resistor to other side of GND wire from battery to motor controller 
   On the Jolt.js side of the resistor, add a 1uF capacitor
 gnd (black) : Fan pin 4 (speed control)
Q2 => temperature sensors (2x DS18B20)
 scl (yellow)  :  DS18B20 data wires https://www.espruino.com/DS18B20 (plus 10k resistor to vcc wire)
 gnd (black) : DS18B20 GND wires
 vcc (red)   : DS18B20 VCC wires
H0 => Throttle control - connect to the middle control wire from the motor speed control via a 10k resistor
      (note that H0 has an internal 2.5k pulldown, which can affect the signal range from the accelerator pedal
      and may stop it reaching 4v = 100%)
```

Ensure that potential dividers are connected to a read GND on the Jolt.js that can never come disconnected, or the
inputs could become over-volted and can destroy the device,

* Connect a fan to the 

## Software in the car

* Get an Android phone and configure it not to turn off 
* On it, point Chrome at [https://gfwilliams.github.io/Greenpower/car.html](https://gfwilliams.github.io/Greenpower/car.html)
* get the URL set up (see below) - it should remember
* Click `Connect`
* Should be done!

## Setting up the Spreadsheet

(based on [this project](https://github.com/jamiewilson/form-to-google-sheets))

* Create a new Google Sheet
* Set top row to have the following fields: `timestamp	V1	V2	V	A	W	throttle	lat	lon	alt	speed	temp1	temp2	fan`
* `Extensions -> Apps Script`
* Replace `myFunction` with:

```
var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(sheetName)

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}
```

* Click `save()`
* Click the run button up top and give it access to everything
* Click `Triggers` on left
* `Add Trigger`, then fill in `doPost`/`Head`/`From spreadsheet`,`On form submit` and `Save`
* Up top right click `Deploy`, `New Deployment`
* Select `Web app` as type. Call it `Greenpower pusher` then allow `Anyone` to use it
* Click `Deploy` and copy the `Web app` URL: `https://script.google.com/macros/s/......./exec`
* Go to `https://gfwilliams.github.io/Greenpower/car.html` on your phone, tap, `set URL` and paste the URL in
  (it might be worth saving the URL in the spreadsheet itself!)

### Spreadsheet Extras

You can create a Sheet2 to show the current values.

* In Row 1, paste in your Web API URL (above) just so you remember it
* In Row 2, Col 1, paste in `=Sheet1!A1` then drag along to column N to clone (this will copy all column headings)
* In Row 3, Col 1, paste in `=CHOOSEROWS(TOCOL(Sheet1!A$3:Sheet1!A$100000,1),-1)` then drag along to column N to clone (this formula will copy the *value in the last populated column*)

Now if you want to add a Gauge:

* Type in a value name, say `Speed` in one spare cell
* In the cell to a right, press `=` and click on a value you're interested in
* Now Highlight both cells, and click `Insert` -> `Chart`
* Under `Chart Editor` on the right, click `Chart Type` and scroll down to `Gauge`
* Now under `Customise`, `Gauge` you can set the range you want for min/max




