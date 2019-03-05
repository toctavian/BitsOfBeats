var canvas;

var banner;

var curve = 0;
var time;
var deviation = 0;
var fade = 255;
var drum_rnn = new mm.MusicRNN('/checkpoints/soul');
var step = 1;
var pixelSize = 25;

var selectedGenre = 0;
var drumSamples;
var player = new Tone.Player({
  retrigger : true
}).toMaster();

var pattern = [];
var wave = [];

var loading = true;
var loadingRoation = 0;
var isPlaying = false;

function playPauseDream() {
  if(isPlaying) {
    Tone.Transport.pause();
    updateSequence();
  }
  else
    playDream();

  isPlaying = !isPlaying;
}

function playDream() {
  var drumPart = new Tone.Part(function(time, value){
    drumSamples.get(value.note).start();
    if (value.note == 36) {
      wave[4] = {r: 150, g: 150, b: 150};
      wave[5] = {r: 200, g: 200, b: 200};
      wave[6] = {r: 255, g: 255, b: 255};
    }
  }, pattern).start("0");
  drumPart.loop = true;

  let bpm;
  switch(selectedGenre) {
    case 0:
      // soul - 75-90
      bpm = 70 + getRandomInt(15);
      break;
    case 1:
      // rap - 85-115
      bpm = 85 + getRandomInt(30);
      break;
    case 2:
      // rnb - 100-130
      bpm = 100 + getRandomInt(30);
      break;
    case 3:
      // neo-soul - 80-95
      bpm = 80 + getRandomInt(15);
      break;
    default:
      bpm = 90;
      break;
  }

  console.log(bpm);
  Tone.Transport.bpm = bpm;
  Tone.Transport.start("+0.1");
}

function updateSequence() {
  const sequenceInfo = {notes:[42], quantizationInfo: {stepsPerQuarter: 4}};
  drum_rnn.continueSequence(sequenceInfo, 16, 1.3).then((dream) => {
    for (var i = 0; i < dream.notes.length; i++) {
      dream.notes[i].quantizedEndStep

      var time = "0:0:"+dream.notes[i].quantizedStartStep%16;
      pattern[i] = {
        note: dream.notes[i].pitch,
        time: time
      };

      loading = false;
    }
    console.log(pattern);
  });
}

function soul() {
  drum_rnn = new mm.MusicRNN('/checkpoints/soul');
  selectedGenre = 0;
  resetMusic();
}

function rap() {
  drum_rnn = new mm.MusicRNN('/checkpoints/rap');
  selectedGenre = 1;
  resetMusic();
}

function rnb() {
  drum_rnn = new mm.MusicRNN('/checkpoints/rnb');
  selectedGenre = 2;
  resetMusic();
}

function neoSoul() {
  drum_rnn = new mm.MusicRNN('/checkpoints/neo-soul');
  selectedGenre = 3;
  resetMusic();
}

function resetMusic() {
  isPlaying = false;
  pattern = [];
  Tone.Transport.stop();
  Tone.Transport.cancel();
  updateSequence();
}


function setup() {
  canvas = createCanvas(innerWidth, innerHeight);  
  frameRate(30);
  curve = 0;

  banner = loadImage('/images/banner.png');

  console.log(wave);

  time = 0;
  
  drumSamples = new Tone.Players({
    36 : '/sounds/drum-kits/rap/kick.wav',
    38 : '/sounds/drum-kits/rap/snare-1.wav',
    42 : '/sounds/drum-kits/rap/tom-low.wav',
    45 : '/sounds/drum-kits/rap/tom-mid.wav',
    49 : '/sounds/drum-kits/rap/tom-high.wav',
    50 : '/sounds/drum-kits/rap/hihat-closed.wav',
    51 : '/sounds/drum-kits/rap/hihat-open.wav'
  }, function() {
    console.log(drumSamples);
    updateSequence();
  }).toMaster();
}

function draw() { 
  background(255);
  translate(innerWidth/2, innerHeight/2);
  textAlign(CENTER, CENTER);

  if (wave.length <  innerWidth/pixelSize) {
    wave.unshift({
      r: 0,
      g: 0,
      b: 0
    });
  } else {
    wave.pop();
    wave.unshift({r:0,g:0,b:0});
  }


  push();
  translate(-pixelSize/2,-pixelSize/2);
  for(i=6;i<wave.length;i++) {
    drawPixelCircle(i, pixelSize, wave[i].r, wave[i].g, wave[i].b);
  }
  pop();
  
  time++;
  if (time == innerWidth/pixelSize) time=1;

  
  if(loading) {
    noFill();
    
    stroke(0);
    strokeWeight(4);
    arc(0, 0, 100, 100, 5*PI/3 + loadingRoation, PI/3 + loadingRoation);

    strokeWeight(1);
    arc(0, 0, 90, 90, 5*PI/3 + loadingRoation * (3/2), PI/3 + loadingRoation * (3/2));
    loadingRoation += PI/20;
    if(loadingRoation == 3*TWO_PI) loadingRoation = 0;
  } else {
    noStroke();
    fill(255);
    ellipse(0, 0, 100, 100);

    fill(174,220,192);
    // textFont(font);
    textSize(30);
    
    fill(0,0,50);
    
    push();
    translate(-pixelSize/2,-pixelSize/2);
    drawPlayPause(pixelSize);
    pop();

    textSize(20);

    if (selectedGenre == 0) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(-350, 200, 100, 30);
      fill(255);
      noStroke();
      text("Soul", -300, 215);
    } else {
      fill(255);
      rect(-350, 200, 100, 30);
      fill(0,0,50);
      text("Soul", -300, 215);
    }

    if (selectedGenre == 1) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(-150, 200, 100, 30);
      fill(255);
      noStroke();
      text("Rap", -100, 215);
    } else {
      fill(255);
      rect(-150, 200, 100, 30);
      fill(0,0,50);
      text("Rap", -100, 215);
    }

    if (selectedGenre == 2) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(50, 200, 100, 30);
      fill(255);
      noStroke();
      text("R&B", 100, 215);
    } else {
      fill(255);
      rect(50, 200, 100, 30);
      fill(0,0,50);
      text("R&B", 100, 215);
    }

    if (selectedGenre == 3) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(250, 200, 100, 30);
      fill(255);
      noStroke();
      text("Neo-Soul", 300, 215);
    } else {
      fill(255);
      rect(250, 200, 100, 30);
      fill(0,0,50);
      text("Neo-Soul", 300, 215);
    }

    // let fps = frameRate();
    // fill(0);
    // stroke(0);
    // text("FPS: " + fps.toFixed(2), -50, 0);

    image(banner, -banner.width / 4, -banner.height / 4 - 250, banner.width / 2, banner.height / 2);
  }
}

function drawPixelCircle(radius, boxSize, r, g, b) {
  switch(selectedGenre) {
    case 0:
      fill(r, g, 1.5*radius);
      break;
    case 1:
      fill(r, 1.5*radius, 1.5*radius);
      break;
    case 2:
      fill(1.5*radius, g, b);
      break;
    case 3:
      fill(r, 1.5*radius, b);
      break;
  }
  
  strokeWeight(1);
  stroke(255,255,255,50);

  if (radius == 1) {
    rect(0, 0, boxSize, boxSize);
  } else {
    for (level = 0; level <= radius; level++)
    {
      let a = level;
      let b = radius - a;
      if (a * boxSize <= innerWidth/2 && b * boxSize <= innerWidth/2) {
        rect( a*boxSize, -b*boxSize, boxSize, boxSize);
        rect(-a*boxSize, -b*boxSize, boxSize, boxSize);
        rect(-b*boxSize,  a*boxSize, boxSize, boxSize);
        rect( b*boxSize,  a*boxSize, boxSize, boxSize);
      }
    }

    wave[radius] = {r,g,b};
  }
}

function drawPlayPause(boxSize) { 
  fill(0, 0, 0); 
 
  if (isPlaying) { 
    // PAUSE 
    rect(+boxSize, -2*boxSize, boxSize, boxSize); 
    rect(+boxSize, -boxSize, boxSize, boxSize);
    rect(+boxSize, 0, boxSize, boxSize); 
    rect(+boxSize, +boxSize, boxSize, boxSize); 
    rect(+boxSize, +2*boxSize, boxSize, boxSize); 
 
    rect(-boxSize, 0, boxSize, boxSize); 
    rect(-boxSize, +boxSize, boxSize, boxSize);
    rect(-boxSize, -boxSize, boxSize, boxSize);
    rect(-boxSize, -2*boxSize, boxSize, boxSize); 
    rect(-boxSize, +2*boxSize, boxSize, boxSize); 
  } else { 
    // PLAY
    rect(0, 0, boxSize, boxSize); 
    rect(0, +boxSize, boxSize, boxSize);
    rect(0, -boxSize, boxSize, boxSize);
    rect(0, -2*boxSize, boxSize, boxSize); 
    rect(0, +2*boxSize, boxSize, boxSize);
    
    rect(boxSize, 0, boxSize, boxSize); 
    rect(boxSize, +boxSize, boxSize, boxSize);
    rect(boxSize, -boxSize, boxSize, boxSize);

    rect(2*boxSize, 0, boxSize, boxSize);
  }  
} 

// When the user clicks the mouse
function mousePressed() {

  var bound_top;
  var bound_bot;
  var bound_left;
  var bound_right;

  mouseX = mouseX - innerWidth/2;
  mouseY = mouseY - innerHeight/2

  var d = dist(mouseX, mouseY, 0, 0);
  if (d < 50 && !loading) {
    playPauseDream();
  }

  bound_top = 200;
  bound_bot = 230;
  bound_left = -350;
  bound_right = -250;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("soul");
    soul();
  }

  bound_top = 200;
  bound_bot = 230;
  bound_left = -150;
  bound_right = -50;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("rap");
    rap();
  }

  bound_top = 200;
  bound_bot = 230;
  bound_left = 50;
  bound_right = 150;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("rnb");
    rnb();
  }

  bound_top = 200;
  bound_bot = 230;
  bound_left = 250;
  bound_right = 350;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("neo-soul");
    neoSoul();
  }
}

function keyPressed() {
  if (keyCode == 32) {
    playPauseDream();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}