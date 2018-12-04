var canvas;

var curve = 0;
var deviation = 0;
var fade = 255;
const drum_rnn = new mm.MusicRNN('https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn');
var drumSamples;
var player = new Tone.Player({
  retrigger : true
}).toMaster();

var pattern = [];

var loading = true;
var loadingRoation = 0;
var isPlaying = false;

function playPauseDream() {
  if(isPlaying) 
    Tone.Transport.pause();
  else
    playDream();

  isPlaying = !isPlaying;
}

function playDream() {
  

  console.log(pattern);
  var drumPart = new Tone.Part(function(time, value){
    drumSamples.get(value.note).start();
  }, pattern).start("0");
  drumPart.loop = true;
  ////////////////////////////////////////////////////////////////////

  // console.log("Here");

  
  // var part = new Tone.Part(function(time, note){
  //     console.log(tone);
  //     console.log("----");
  //     console.log(time);

  //     drumSamples.triggerAttackRelease(note, "8n", time);
  // }, [["0:0:2", melody[0].note], ["0:1", melody[1].note], ["0:1:3", melody[2].note]]).start(0);
  
  ////////////////////////////////////////////////////////////////////////
  // var loop = new Tone.Sequence(function(time, note){
    
  //   for (var i = 0; i < melody.length; i++) {
  //     for (var y = 0; Y < melody[i].note.length; y++) {
  //       var vel = Math.random() * 0.5 + 0.5;
  //       drumSamples.get(melody[i].note[y]).triggerAttackRelease(time);
  //     }
  //   }
      
  // }, "16n");

  Tone.Transport.bpm.value = 60;
  Tone.Transport.start("+0.1");
}

function updateSequence() {
  const sequenceInfo = {notes:[], quantizationInfo: {stepsPerQuarter: 4}};
  
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
  });
}


function setup() {
  canvas = createCanvas(innerWidth, innerHeight);  
  frameRate(30);
  curve = 0;
  
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
  background(174,220,192);
  
  if(loading) {
    noFill();
    
    stroke(255);
    strokeWeight(4);
    arc(innerWidth/2, innerHeight/2, 100, 100, 5*PI/3 + loadingRoation, PI/3 + loadingRoation);

    strokeWeight(1);
    arc(innerWidth/2, innerHeight/2, 90, 90, 5*PI/3 + loadingRoation * (3/2), PI/3 + loadingRoation * (3/2));
    loadingRoation += PI/20;
    if(loadingRoation == 3*TWO_PI) loadingRoation = 0;
  } else {
    noStroke();
    fill(255);
    ellipse(innerWidth/2, innerHeight/2, 100, 100);

    fill(174,220,192);
    // textFont(font);
    textSize(30);
    textAlign(CENTER, CENTER);
    
    if (isPlaying) {
      text("Stop", innerWidth/2, innerHeight/2);
    } else {
      text("Play", innerWidth/2, innerHeight/2);
    }
  }
  // if(deviation < curve) {
  //   deviation = curve;
  // } else {
  //   deviation = deviation - (deviation - curve)/100;
  // }

  // if (deviation <= 200 && fade !=0) fade-=1.5;
  // curve = fft.getEnergy("bass") * 2;

  // noStroke();
  // fill(123, 211, 137, fade);
  // ellipse(innerWidth/2, innerHeight/2, deviation, deviation);

  // stroke(123, 211, 137);
  // fill(56,288,174);
  // ellipse(innerWidth/2,innerHeight/2,curve,curve);
} 

// When the user clicks the mouse
function mousePressed() {

  var d = dist(mouseX, mouseY, innerWidth/2, innerHeight/2);
  if (d < 50 && !loading) {
    playPauseDream();
  }
}