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