const JOLTJS_CODE = `
\x10NRF.on("disconnect",function() {
  if (global.stop) stop();
  reset();
});
\x10Modules.addCached("DS18B20x",function(){function e(a,b){this.bus=a;void 0===b?this.sCode=this.bus.search()[0]:parseInt(b).toString()==b&&0<=b&&126>=b?this.sCode=this.bus.search()[b]:this.sCode=b;if(!this.sCode)throw Error("No DS18B20 found");this.type=parseInt(this.sCode[0]+this.sCode[1])}e.prototype._r=function(){var a=this.bus;a.select(this.sCode);a.write(190);return a.read(9)};e.prototype._w=function(a,b,f){var c=this.bus;c.select(this.sCode);c.write([78,a,b,f]);c.select(this.sCode);c.write(72);c.reset()};e.prototype.setRes=
function(a){var b=this._r();a=[31,63,95,127][E.clip(a,9,12)-9];this._w(b[2],b[3],a)};e.prototype.getRes=function(){return[31,63,95,127].indexOf(this._r()[4])+9};e.prototype.isPresent=function(){return-1!==this.bus.search().indexOf(this.sCode)};e.prototype.getTemp=function(a){function b(f){for(var c=f._r(),g=0,d=0;8>d;d++){g^=c[d];for(var h=0;8>h;h++)g=g>>1^140*(g&1)}d=null;g==c[8]&&(d=c[0]+(c[1]<<8),d&32768&&(d-=65536),d/=10==f.type?2:16);a&&a(d);return d}this.bus.select(this.sCode);this.bus.write(68,
!0);if(!a)return b(this);setTimeout(b,{9:94,10:188,11:375,12:750}[this.getRes()],this)};e.prototype.searchAlarm=function(){return this.bus.search(236)};e.prototype.setAlarm=function(a,b){a--;0>a&&(a+=256);0>b&&(b+=256);var f=this._r();this._w(b,a,f[4])};exports.connect=function(a,b){return new e(a,b)}});
\x10var saadc=function(a){var b={status:1073771520,enable:1073771776,amount:1073772084,tStart:1073770496,tSample:1073770500,tStop:1073770504,tCalib:1073770508,
eResultDone:1073770764,eEnd:1073770756,setDMA:function(c){c=c||{};poke32(1073772076,0|c.ptr);poke32(1073772080,0|c.cnt)},sample:function(c){poke32(b.enable,1);c=c||1;if(1<c&&!a.samplerate)throw"Can't do >1 sample with no samplerate specified";if(1<c&&1<a.channels.length)throw"Can't do >1 channel with a samplerate specified";var f=new Uint16Array(Math.max(c*a.channels.length,32)),g=E.getAddressOf(f,!0);b.setDMA({ptr:g,cnt:c*a.channels.length});poke32(b.eEnd,0);poke32(b.tStart,1);for(poke32(b.tSample,
1);!peek32(b.eEnd););poke32(b.tStop,1);b.setDMA();poke32(1073770756,0);poke32(b.enable,0);return f.slice(0,c*a.channels.length)},start:function(){this.stop();a.channels.forEach(function(c,f){f=1073771792+16*f;var g=d.indexOf(c.pinpull)|d.indexOf(c.npinpull)<<4|e.indexOf(c.gain)<<8|!!c.refvdd<<12|h.indexOf(c.tacq)<<16|(void 0!==c.npin)<<20|!!a.oversample<<24;poke32(f+8,g);poke32(f,0|(new Pin(c.pin)).getInfo().channel+1);poke32(f+4,0|(c.npin&&(new Pin(c.npin)).getInfo().channel)+1)});poke32(1073772016,
a.resolution-8>>1);poke32(1073772020,0|a.oversample);poke32(1073772024,a.samplerate|!!a.samplerate<<12);b.setDMA(a.dma)},stop:function(){poke32(b.enable,0);poke32(1073772020,0);for(var c=0;8>c;c++)poke32(1073771792+16*c,0)}},d=[void 0,"down","up","vcc/2"],e=[1/6,.2,.25,1/3,.5,1,2,4],h=[3,5,10,15,20,40];a.resolution||(a.resolution=14);if(!a.channels||8<a.channels.length)throw"Invalid channels";if(a.oversample&&1<a.channels.length)throw"Can't oversample with >1 channel";if(a.samplerate&&1<a.channels.length)throw"Can't use samplerate with >1 channel";
a.channels.forEach(function(c,f){c.gain||(c.gain=1);c.tacq||(c.tacq=3);if(0>d.indexOf(c.pinpull))throw"Invalid pinpull";if(0>d.indexOf(c.npinpull))throw"Invalid npinpull";if(0>e.indexOf(c.gain))throw"Invalid gain";if(0>h.indexOf(c.tacq))throw"Invalid tacq";});b.start();return b};
\x10var data;
\x10var currentSense = saadc({
  channels : [ { // channel 0
    pin:Q1.sda, npin:Q1.scl,
    gain:4,
    tacq:40,
    refvdd:true,
  } ],
  oversample : 8
});
\x10currentSense.stop();
\x10function rnd(v) { return Math.round(v*100)/100 }
\x10function getData() {
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
    data.fan = (data.temp1 > 30)?((data.temp1 > 40)?2:1):0;
    setFan(data.fan);
  }
  data.temp2 = sensor2.getTemp();
  if (data.temp2==85 || data.temp2===null) data.temp2="";
  Bluetooth.println(JSON.stringify(data));
  LED1.pulse(1,100);
}
\x10function setFan(v) {
  if (v==1) {
    Q0.setPower(1);Q1.setPower(1); // fan on slow
  } else if (v==2) {
    Q0.setPower(1);Q1.setPower(0); // fan on fast
  } else {
    Q0.setPower(0);Q1.setPower(0); // fan off
  }
}
\x10function start() {
  Q2.setPower(1);
  setInterval(getData, 1000);
}
\x10function stop() {
  clearInterval();
  Q2.setPower(0);
  setFan(0);
}
\x10Jolt.setDriverMode(0,false); // driver 0 off - INPUT ONLY (throttle)
\x10pinMode(H0,"input"); // force output disable
\x10var ow = new OneWire(Q2.scl);
\x10var sensor1 = require("DS18B20x").connect(ow, "28ff33dd641401ac" );
\x10var sensor2 = require("DS18B20x").connect(ow, "28ff8b996414038f" );
\x10start();
\n`;
// ow.search() => [ "28ff33dd641401ac", "28ff8b996414038f" ]
////NRF.on("disconnect",stop); we just reset now
