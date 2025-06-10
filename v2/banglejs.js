E.showMessage("LOADING...");
NRF.on("disconnect",()=>load());
var map = Graphics.createArrayBuffer(88,88,1);
var mapPos = { min:undefined, max:undefined, centre:{x:0,y:0} };
var MAPX=88,MAPY=24;
var lastMessage, lastMessageTime = getTime();

function getCoords(latlon) {
  var p = Bangle.project(latlon);
  return {
    x : Math.round(44 + (p.x - mapPos.centre.x)/10), // 880m map area?
    y : Math.round(44 + (p.y - mapPos.centre.y)/10),
  };
}

function onGPS(fix) {
  g.reset().clearRect(Bangle.appRect);
  g.setFontAlign(-1,0).setFont17().drawString(fix.satellites+ " Sats, MPH",8,35);
  g.setFontAlign(0,0).setFont("28:3").drawString(fix.fix?Math.round(fix.speed*0.621371):"--",44,90);
  if (fix.fix && fix.satellites>4) {
    let p = Bangle.project(fix);
    if (!mapPos.min) mapPos.min = p.clone();
    if (!mapPos.max) mapPos.max = p.clone();
    mapPos.min.x = Math.min(mapPos.min.x, p.x);
    mapPos.max.x = Math.max(mapPos.max.x, p.x);
    mapPos.min.y = Math.min(mapPos.min.y, p.y);
    mapPos.max.y = Math.max(mapPos.max.y, p.y);
    mapPos.centre.x = (mapPos.min.x + mapPos.max.x)/2;
    mapPos.centre.y = (mapPos.min.y + mapPos.max.y)/2;
    let c = getCoords(fix);
    map.setPixel(c.x, c.y);
  }
  g.setColor("#00f").drawImage(map,MAPX,MAPY);
  if (fix.fix && fix.satellites>4) {
    let c = getCoords(fix);
    if (c.x>=0 && c.y>=0 && c.x<map.getWidth() && c.y<map.getHeight()) {
      c.x += MAPX;
      c.y += MAPY;
      g.setColor("#000").fillRect(c.x-2, c.y-2, c.x+2, c.y+2);
    }
  }
  if (lastMessage && lastMessageTime+60<getTime()) lastMessage = undefined; // timeout
  if (lastMessage) {
    var f = g.findFont(lastMessage, {w:170, wrap:true}), y = g.getHeight()-f.h-6;
    g.setBgColor("#f00").clearRect(0,y,g.getWidth(),g.getHeight());
    g.setColor("#fff").setFontAlign(0,1).drawString(f.text, g.getWidth()/2, g.getHeight());
    g.setColor("#f00").setFont17().setFontAlign(-1,1).drawString(Math.round(getTime()-lastMessageTime),0,y);
    Bangle.setBacklight(1);
    setTimeout(() => Bangle.setBacklight(0),500);
  }
  Bluetooth.println(JSON.stringify({lat:Math.round(fix.lat*10000)/10000,lon:Math.round(fix.lon*10000)/10000,v:Math.round(fix.speed*100)/100/*kph*/}));
}
function msg(m) {
  lastMessage = m;
  lastMessageTime = getTime();
  onGPS(Bangle.getGPSFix());
}

// onGPS({fix:1,satellites:3,speed:200}); // testing
Bangle.loadWidgets();Bangle.drawWidgets();
Bangle.on('GPS', onGPS);
Bangle.setGPSPower(1, "app");
setWatch(function() {
  map.clear();
  onGPS(Bangle.getGPSFix());
}, BTN, {repeat:true});
onGPS({fix:0,satellites:0});
