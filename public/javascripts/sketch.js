var canvas;

var banner;

var curve = 0;
var time;
var deviation = 0;
var fade = 255;
var drum_rnn = new mm.MusicRNN('/checkpoints/soul');
var step = 1;

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
    if (value.note == 36)
      wave[0] = {r: 255, g: 255, b: 255};
  }, pattern).start("0");
  drumPart.loop = true;

  Tone.Transport.bpm.value = 70;
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
  updateSequence();
}

function rap() {
  drum_rnn = new mm.MusicRNN('/checkpoints/rap');
  selectedGenre = 1;
  updateSequence();
}

function rnb() {
  drum_rnn = new mm.MusicRNN('/checkpoints/rnb');
  selectedGenre = 2;
  updateSequence();
}

function neoSoul() {
  drum_rnn = new mm.MusicRNN('/checkpoints/neo-soul');
  selectedGenre = 3;
  updateSequence();
}


function setup() {
  canvas = createCanvas(innerWidth, innerHeight);  
  // frameRate(30);
  curve = 0;

  banner = loadImage('/images/banner.png');

  console.log(wave);

  time = 0;
  
  drumSamples = new Tone.Players({
    36 : '/sounds/drum-kits/dubstep/kick.mp3',
    38 : '/sounds/drum-kits/dubstep/snare.mp3',
    42 : '/sounds/drum-kits/dubstep/tom-low.mp3',
    45 : '/sounds/drum-kits/dubstep/tom-mid.mp3',
    49 : '/sounds/drum-kits/dubstep/tom-high.mp3',
    50 : '/sounds/drum-kits/dubstep/hihat-closed.mp3',
    51 : '/sounds/drum-kits/dubstep/hihat-open.mp3'
  }, function() {
    console.log(drumSamples);
    updateSequence();
  }).toMaster();
}

function draw() { 
  background(255);
  translate(innerWidth/2, innerHeight/2);

  if (wave.length <  200) {
    wave.unshift({
      r: 0,
      g: 0,
      b: 0
    });
  } else {
    wave.pop();
    wave.unshift({r:0,g:0,b:0});
  }

  for(i=1;i<wave.length;i++) {
    drawPixelCircle(i, 25, wave[i].r, wave[i].g, wave[i].b);
  }
  
  time++;
  if (time == 150) time=1;

  
  if(loading) {
    noFill();
    
    stroke(255);
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
    textAlign(CENTER, CENTER);
    
    fill(0,0,50);
    if (isPlaying) {
      text("Stop", 0, 0);
    } else {
      text("Play", 0, 0);
    }

    textSize(20);

    if (selectedGenre == 0) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(0 - 350, 0 + 200, 100, 30);
      fill(255);
      noStroke();
      text("Soul", 0 - 300, 0 + 215);
    } else {
      fill(255);
      rect(0 - 350, 0 + 200, 100, 30);
      fill(0,0,50);
      text("Soul", 0 - 300, 0 + 215);
    }

    if (selectedGenre == 1) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(0 - 150, 0 + 200, 100, 30);
      fill(255);
      noStroke();
      text("Rap", 0 - 100, 0 + 215);
    } else {
      fill(255);
      rect(0 - 150, 0 + 200, 100, 30);
      fill(0,0,50);
      text("Rap", 0 - 100, 0 + 215);
    }

    if (selectedGenre == 2) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(0 + 50, 0 + 200, 100, 30);
      fill(255);
      noStroke();
      text("R&B", 0 + 100, 0 + 215);
    } else {
      fill(255);
      rect(0 + 50, 0 + 200, 100, 30);
      fill(0,0,50);
      text("R&B", 0 + 100, 0 + 215);
    }

    if (selectedGenre == 3) {
      fill(0,0,0,0);
      stroke(255);
      strokeWeight(2);
      rect(0 + 250, 0 + 200, 100, 30);
      fill(255);
      noStroke();
      text("Neo-Soul", 0 + 300, 0 + 215);
    } else {
      fill(255);
      rect(0 + 250, 0 + 200, 100, 30);
      fill(0,0,50);
      text("Neo-Soul", 0 + 300, 0 + 215);
    }

    image(banner, -banner.width / 4, -banner.height / 4 - 200, banner.width / 2, banner.height / 2);
    
    drawAxis();
  }
}

function drawAxis() {
  fill(255,0,0);
  line(0, 0, innerWidth, 0);
  fill(0,0,255);
  line(0, 0, 0, innerHeight);
}

function drawPixelCircle(radius, boxSize, r, g, b) {
  fill(r, g, b);

  var max = 1 + 2 * (radius - 1);

  var a = max;
  var b = 1;
  for (level = 1; level <= radius; level++)
  {
    rect(0+a*boxSize/2, 0-b*boxSize/2, boxSize, boxSize);
    rect(0-a*boxSize/2, 0-b*boxSize/2, boxSize, boxSize);
    rect(0-a*boxSize/2, 0+b*boxSize/2, boxSize, boxSize);
    rect(0+a*boxSize/2, 0+b*boxSize/2, boxSize, boxSize);
    a-=2; b+=2;
  }

  wave[radius] = {r, g, b};
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

  bound_top = 0 + 200;
  bound_bot = 0 + 230;
  bound_left = 0 - 350;
  bound_right = 0 - 250;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("soul");
    soul();
  }

  bound_top = 0 + 200;
  bound_bot = 0 + 230;
  bound_left = 0 - 150;
  bound_right = 0 - 50;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("rap");
    rap();
  }

  bound_top = 0 + 200;
  bound_bot = 0 + 230;
  bound_left = 0 + 50;
  bound_right = 0 + 150;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("rnb");
    rnb();
  }

  bound_top = 0 + 200;
  bound_bot = 0 + 230;
  bound_left = 0 + 250;
  bound_right = 0 + 350;
  if (mouseX >= bound_left && mouseX <= bound_right && mouseY >= bound_top && mouseY <= bound_bot){
    console.log("neo-soul");
    neoSoul();
  }

  console.log("mouseX: " + mouseX + "; mouseY: " + mouseY + ";");
  console.log("bound_left: " + bound_left + "; bound_right: " + bound_right + "; bound_top: " + bound_top + "; bound_bot: " + bound_bot + ";");
}