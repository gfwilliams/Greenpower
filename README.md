Greenpower receiver
===================

https://gfwilliams.github.io/Greenpower/

## In the car

* Wire up a Jolt.js:

```
Q0 => battery voltage cable
Q1 => battery amps cable
Q2 => tempertaure sensors
H0 => Throttle control
```
* Get an Android phone and configure it not to turn off 
* On it, point Chrome at [https://gfwilliams.github.io/Greenpower/car.html](https://gfwilliams.github.io/Greenpower/car.html)
* get the URL set up (see below) - it should remember
* Click `Connect`
* Should be done!

## On the receiver

(based on [this project](https://github.com/jamiewilson/form-to-google-sheets))

* Create a new Google Sheet
* Set top row to: `timestamp	V1	V2	V	A	W	throttle`
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
* Click `Deploy` and copy the `Web app` URL: https://script.google.com/macros/s/......./exec
* Go to https://gfwilliams.github.io/Greenpower/car.html on your phone, tap, `set URL` and paste it in


