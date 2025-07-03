const VERSION=3;
const BLEUART = {connect:function(r){var k,l,m,n,f,h={write:function(a){return new Promise(function b(g,e){a.length?(n.writeValue(a.substr(0,20)).then(function(){b(g,e)}).catch(e),a=a.substr(20)):g()})},disconnect:function(){return k.disconnect()},eval:function(a){return new Promise(function(c,g){function e(){var d=b.indexOf("\n");if(0<=d){clearTimeout(p);f=p=void 0;var q=b.substr(0,d);try{c(JSON.parse(q))}catch(t){g(q)}b.length>d+1&&h.emit("data",b.substr(d+1))}}var b="";var p=setTimeout(e,
5E3);f=function(d){b+=d;0<=b.indexOf("\n")&&e()};h.write("\x03\x10Bluetooth.write(JSON.stringify("+a+")+'\\n')\n").then(function(){})})}};return r.gatt.connect().then(function(a){k=a;return k.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){l=a;return l.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){n=a;return l.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){m=a;m.on("characteristicvaluechanged",function(c){c=
E.toString(c.target.value.buffer);f?f(c):h.emit("data",c)});return m.startNotifications()}).then(function(){return h})}};
Modules.addCached("DS18B20x",function(){function e(a,b){this.bus=a;void 0===b?this.sCode=this.bus.search()[0]:parseInt(b).toString()==b&&0<=b&&126>=b?this.sCode=this.bus.search()[b]:this.sCode=b;if(!this.sCode)throw Error("No DS18B20 found");this.type=parseInt(this.sCode[0]+this.sCode[1])}e.prototype._r=function(){var a=this.bus;a.select(this.sCode);a.write(190);return a.read(9)};e.prototype._w=function(a,b,f){var c=this.bus;c.select(this.sCode);c.write([78,a,b,f]);c.select(this.sCode);c.write(72);c.reset()};e.prototype.setRes=
function(a){var b=this._r();a=[31,63,95,127][E.clip(a,9,12)-9];this._w(b[2],b[3],a)};e.prototype.getRes=function(){return[31,63,95,127].indexOf(this._r()[4])+9};e.prototype.isPresent=function(){return-1!==this.bus.search().indexOf(this.sCode)};e.prototype.getTemp=function(a){function b(f){for(var c=f._r(),g=0,d=0;8>d;d++){g^=c[d];for(var h=0;8>h;h++)g=g>>1^140*(g&1)}d=null;g==c[8]&&(d=c[0]+(c[1]<<8),d&32768&&(d-=65536),d/=10==f.type?2:16);a&&a(d);return d}this.bus.select(this.sCode);this.bus.write(68,
!0);if(!a)return b(this);setTimeout(b,{9:94,10:188,11:375,12:750}[this.getRes()],this)};e.prototype.searchAlarm=function(){return this.bus.search(236)};e.prototype.setAlarm=function(a,b){a--;0>a&&(a+=256);0>b&&(b+=256);var f=this._r();this._w(b,a,f[4])};exports.connect=function(a,b){return new e(a,b)}});
var saadc=function(a){var b={status:1073771520,enable:1073771776,amount:1073772084,tStart:1073770496,tSample:1073770500,tStop:1073770504,tCalib:1073770508,
eResultDone:1073770764,eEnd:1073770756,setDMA:function(c){c=c||{};poke32(1073772076,0|c.ptr);poke32(1073772080,0|c.cnt)},sample:function(c){poke32(b.enable,1);c=c||1;if(1<c&&!a.samplerate)throw"Can't do >1 sample with no samplerate specified";if(1<c&&1<a.channels.length)throw"Can't do >1 channel with a samplerate specified";var f=new Uint16Array(Math.max(c*a.channels.length,32)),g=E.getAddressOf(f,!0);b.setDMA({ptr:g,cnt:c*a.channels.length});poke32(b.eEnd,0);poke32(b.tStart,1);for(poke32(b.tSample,
1);!peek32(b.eEnd););poke32(b.tStop,1);b.setDMA();poke32(1073770756,0);poke32(b.enable,0);return f.slice(0,c*a.channels.length)},start:function(){this.stop();a.channels.forEach(function(c,f){f=1073771792+16*f;var g=d.indexOf(c.pinpull)|d.indexOf(c.npinpull)<<4|e.indexOf(c.gain)<<8|!!c.refvdd<<12|h.indexOf(c.tacq)<<16|(void 0!==c.npin)<<20|!!a.oversample<<24;poke32(f+8,g);poke32(f,0|(new Pin(c.pin)).getInfo().channel+1);poke32(f+4,0|(c.npin&&(new Pin(c.npin)).getInfo().channel)+1)});poke32(1073772016,
a.resolution-8>>1);poke32(1073772020,0|a.oversample);poke32(1073772024,a.samplerate|!!a.samplerate<<12);b.setDMA(a.dma)},stop:function(){poke32(b.enable,0);poke32(1073772020,0);for(var c=0;8>c;c++)poke32(1073771792+16*c,0)}},d=[void 0,"down","up","vcc/2"],e=[1/6,.2,.25,1/3,.5,1,2,4],h=[3,5,10,15,20,40];a.resolution||(a.resolution=14);if(!a.channels||8<a.channels.length)throw"Invalid channels";if(a.oversample&&1<a.channels.length)throw"Can't oversample with >1 channel";if(a.samplerate&&1<a.channels.length)throw"Can't use samplerate with >1 channel";
a.channels.forEach(function(c,f){c.gain||(c.gain=1);c.tacq||(c.tacq=3);if(0>d.indexOf(c.pinpull))throw"Invalid pinpull";if(0>d.indexOf(c.npinpull))throw"Invalid npinpull";if(0>e.indexOf(c.gain))throw"Invalid gain";if(0>h.indexOf(c.tacq))throw"Invalid tacq";});b.start();return b};
var data; // last sent data
var state = {
  wattHours : 0 // watt hours used
};
var loraCounter=0;
var currentSense = saadc({
  channels : [ { // channel 0
    pin:Q1.sda, npin:Q1.scl,
    gain:4,
    tacq:40,
    refvdd:true,
  } ],
  oversample : 8
});
currentSense.stop();
function rnd(v) { return Math.round(v*100)/100; }
function getData() {
  var va = 0, vb = 0, a = 0;
  for (var i=0;i<10;i++) {
    va += Q0.sda.analog();
    vb += Q0.scl.analog();
  }
  data = {
    t : "data",
    V1 : rnd(3.72*va),
    V : rnd(3.72*vb),
    throttle : rnd(E.clip(H0.analog()/3.9,0,1))
  };
  currentSense.start();
  data.A = currentSense.sample()[0];
  currentSense.stop();
  if (data.A>32768) data.A=0;//rolled over -> negative
  data.V2 = data.V-data.V1;
  data.A /= 10;
  data.W = rnd(data.V*data.A);
  data.temp1 = sensor1.getTemp();
  if (data.temp1==85 || data.temp1===null) {
    data.temp1="";
  } else {
    data.fan = (data.temp1 > 25)?((data.temp1 > 30)?2:1):0;
    setFan(data.fan);
  }
  data.temp2 = sensor2.getTemp();
  if (data.temp2==85 || data.temp2===null) data.temp2="";
  state.wattHours += data.V*data.A/3600;
  data.WH = rnd(state.wattHours);
  data.bat = rnd(E.getAnalogVRef());
  data.lat = state.lat;
  data.lon = state.lon;
  data.vel = rnd(state.vel);

  //Bluetooth.println(JSON.stringify(data));
  LED1.pulse(1,100);

  loraCounter++;
  if (loraCounter>2) {
    LED3.pulse(1,100);
    loraCounter = 0;
    HC14.send({
      sw:VERSION,
      V:data.V, V1:data.V2, V2:data.V2, A:data.A, W:data.W, WH:data.WH,
      T1:data.temp1, T2:data.temp2,
      th:data.throttle, b:data.bat,
      lat:data.lat, lon:data.lon, vel:data.vel,
      l:state.l, t:state.t // lap count, lap time
    });
  }
}
function setFan(v) {
  if (v==1) {
    Q0.setPower(0);Q1.setPower(1); // fan on slow
  } else if (v==2) {
    Q0.setPower(0);Q1.setPower(0); // fan on fast
  } else {
    Q0.setPower(1);Q1.setPower(1); // fan off
  }
}
function start() {
  Q2.setPower(1);
  setInterval(getData, 1000);
}
function stop() {
  clearInterval();
  Q2.setPower(0);
  setFan(0);
}
Jolt.setDriverMode(0,false); // driver 0 off - INPUT ONLY (throttle)
pinMode(H0,"input"); // force output disable
var ow = new OneWire(Q2.scl);
var sensor1 = require("DS18B20x").connect(ow, "28ff33dd641401ac" );
var sensor2 = require("DS18B20x").connect(ow, "28ff8b996414038f" );
start();

// LoRa
var HC14 = {
  key : Q3.vcc,
  sta : Q3.gnd,
  serial : Serial1,
  send : json => {
    //console.log("LoRa>"+E.toJS(json));
    HC14.serial.println(E.toJS(json));
  },
  msg : "" // input message
};
HC14.sta.mode("input");
HC14.key.write(1); // normal radio mode
//HC14.key.write(0); // cmd radio mode
HC14.serial.setup(9600, { rx: Q3.sda, tx : Q3.scl });
/* // on a new device?
HC14.key.write(0); // config mode
HC14.serial.println("AT+S4")
*/
HC14.serial.on("data", d => {
  console.log("LoRa in< "+E.toJS(d));
  HC14.msg += d;
  var l = HC14.msg.split("\r");
  while (l.length>1) HC14.emit("line", l.shift().trim());
  HC14.msg = l[0];
});
HC14.on("line", line => {
  console.log("LoRa<"+E.toJS(line));
  if (line[0]=="{") try {
    let json = JSON.parse(line);
    console.log("LoRa JSON", json);
    if (json.t=="msg" && bangleUart!==undefined) {
      console.log(`Sending message to Bangle (${E.toJS(json.d)})`);
      bangleUart.write(`msg(${E.toJS(json.d)})\n`);
    }
  } catch (e) {}
});

// Find devices
var bangle, bangleUart;
function checkBangle() {
  if (bangle && bangle.gatt.connected) return;
  console.log("Connecting to Bangle");
  NRF.requestDevice({ filters: [{ namePrefix: 'Bangle.js 63b2' }] }).then((d) => {
    bangle = d;
    return BLEUART.connect(bangle);
  }).then((u) => {
    bangleUart = u;
    console.log("Bangle Connected");
    return bangleUart.write("\x10reset()\n");
  }).then(() => {
    return new Promise(resolve=>setTimeout(resolve,200));
  }).then(() => {
    return bangleUart.write(`echo(0);
E.showMessage("LOADING...");
NRF.on("disconnect",()=>load());

var TRACKDIR = {
  N:[1,0], S:[-1,0],
  E:[0,1], W:[0,-1], // untested
};
// https://racerender.com/TrackAddict/docs/TrackList.html
var TRACKS = [
{n:"Goodwood",lat:50.8579843,lon:-0.7524964,dir:"S"},
{n:"Blyton",lat:53.460354, lon:-0.688675, dir:"N"},
{n:"Mallory",lat:52.5986523,lon:-1.3369360, dir:"S"}
];
var TRK = undefined; // current track
var map = Graphics.createArrayBuffer(88,88,1);
var mapCentre = {x:0,y:0};
var MAPX=88,MAPY=24;
var lap = 0;
var lastLap = getTime();
var inMenu = false;
var prevTimes = [];

function getCoords(latlon) {
  var p = Bangle.project(latlon);
  return {
    x : Math.round(44 + (p.x - TRK.centre.x)/15),
    y : Math.round(44 - (p.y - TRK.centre.y)/15),
  };
}

function formatTime(s) {
  var mins = Math.floor(s/60);
  var secs = Math.round(s - (mins*60));
  if (mins>10) {
    mins = "-";
    secs = "--";
  }
  return mins+":"+secs.toString().padStart(2,0);
}

function drawTime() {
  g.setColor(0);
  g.setFont("22:2").setFontAlign(-1,1).drawString(formatTime(getTime()-lastLap), 4,g.getHeight()-4);
  var lastTime = prevTimes[prevTimes.length-4];
  var lastTimes = prevTimes.slice(-3);
  lastTimes.forEach((time,i) => {
    var py = g.getHeight() - (i+1)*20;
    g.setColor(0).setFont("22").setFontAlign(-1,-1).drawString(formatTime(time), 100, py);
    if (i==lastTimes.length-1) g.drawString("*", 90, py);
    g.setColor((lastTime>=time) ? "#0f0" : "#f00").fillRect(140,py,175,py+19);
    lastTime = time;
  });
}

// find nearest track
function findTrack(fix) {
  var dist;
  TRACKS.forEach(track => {
    var dlat = fix.lat - track.lat;
    var dlon = fix.lon - track.lon;
    var d = Math.sqrt(dlat*dlat + dlon*dlon);
    if (dist===undefined || d<dist) {
      dist = d;
      TRK = track;
    }
  });
  // set up center pt
  TRK.centre = Bangle.project(TRK);
  TRK.dirv = TRACKDIR[TRK.dir];
  //print(dist, TRK);
}

function onGPS(fix) {
  if (fix.fix && fix.satellites>4) {
    if (TRK===undefined) findTrack(fix);
    if (TRK!==undefined) {
      let p = Bangle.project(fix);
      let c = getCoords(fix);
      // update map
      map.fillRect(c.x, c.y, c.x+1, c.y+1);
      // check for laps
      var dlat = fix.lat - TRK.lat;
      var dlon = fix.lon - TRK.lon;
      var d = Math.sqrt(dlat*dlat + dlon*dlon);
      if (d < 0.0004) {
        var dp = dlat*TRK.dirv[0] + dlon*TRK.dirv[1];
        if (prevPos!==undefined && prevPos<0 && dp>=0) {
          prevTimes.push(getTime()-lastLap);
          if (prevTimes.length>10) prevTimes = prevTimes.slice(-10);
          lastLap = getTime();
          lap++;
          //console.log("LAP");
        }
        prevPos = dp;

      } else prevPos = undefined;
    }
  }
  if (!inMenu) {
    g.reset().clearRect(Bangle.appRect);
    g.setFontAlign(-1,0).setFont17().drawString(fix.satellites+ " Sats, MPH",8,35);
    g.setFontAlign(0,0).setFont("28:3").drawString(fix.fix?Math.round(fix.speed*0.621371):"--",44,90);
    g.setColor("#f00").drawImage(map,MAPX,MAPY);
    if (fix.fix && fix.satellites>4) {
      let c = getCoords(fix);
      if (c.x>=0 && c.y>=0 && c.x<map.getWidth() && c.y<map.getHeight()) {
        c.x += MAPX;
        c.y += MAPY;
        g.setColor("#000").fillRect(c.x-4, c.y-4, c.x+4, c.y+4);
      }
    }
    drawTime();
  }

  Bluetooth.println(JSON.stringify({lat:Math.round(fix.lat*10000)/10000,lon:Math.round(fix.lon*10000)/10000,v:Math.round(fix.speed*100)/100/*kph*/,l:lap,t:Math.round(getTime()-lastLap)}));
}
function msg(m) {
}

// onGPS({fix:1,satellites:3,speed:200}); // testing
Bangle.loadWidgets();Bangle.drawWidgets();
Bangle.on('GPS', onGPS);
//Bangle.setGPSPower(1, "app");
function start() {
  inMenu = false;
  onGPS({fix:0,satellites:0});
  Bangle.setUI({mode:"custom", btn : ()=>{
    inMenu = true;
    E.showMenu({ "" : {back: start},
      "Clear Map" : () => { map.clear(); start(); },
      "Clear Lap Count" : () => { lap=0; start(); },
      "Clear Times" : () => { prevTimes=[]; start(); }
    });
  }});
};
start();

Bangle.setGPSPower(0, "app");
`);
  }).then(() => {
    bangleUart.msg = "";
    bangleUart.on("data", d=>{
      bangleUart.msg += d;
      var l = bangleUart.msg.split("\r");
      while (l.length>1) bangleUart.emit("line", l.shift().trim());
      bangleUart.msg = l[0];
    });
    bangleUart.on("line", line=>{
      //console.log("Bangle>", line);
      if (line[0]=="{") try {
        let json = JSON.parse(line);
        //console.log("Bangle JSON>", json);
        if (json.lat && json.lon) {
          state.lat = json.lat;
          state.lon = json.lon;
          state.vel = json.v;
        }
        state.l = json.l; // lap count
        state.t = json.t; // lap time
      } catch (e) {}
    });
    console.log("Bangle Ready");
  }).catch((e) => {
    console.log("Bangle not found", e);
  });
}
setInterval(checkBangle, 30000); // check every 30s if we have a Banglre
