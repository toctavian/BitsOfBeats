var y = 100;
var curve = 0;
var deviation = 0;
var bands = 512;
var fade = 255;

function preload() {
  soundFormats('mp3', 'ogg', 'wav');
  beat = loadSound('../sound/sample.wav');
}

function setup() {
  var cnv = createCanvas(innerWidth, innerHeight);  
  frameRate(30);
  curve = 0;
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT();
  beat.amp(0.5);
}

function draw() { 
  background(174,220,192);
  
  var spectrum = fft.analyze();
  console.log(curve);
  if(deviation < curve) {
    deviation = curve;
  } else {
    deviation = deviation - (deviation - curve)/100;
  }

  if (deviation <= 200 && fade !=0) fade-=1.5;
  curve = fft.getEnergy("bass") * 2;

  noStroke();
  fill(123, 211, 137, fade);
  ellipse(innerWidth/2, innerHeight/2, deviation, deviation);

  stroke(123, 211, 137);
  fill(56,288,174);
  ellipse(innerWidth/2,innerHeight/2,curve,curve);

  console.log(deviation + " " + curve);
} 

function togglePlay() {
  if (beat.isPlaying()) {
    beat.pause();
  } else {
    beat.loop();
    fade = 255.0;
  }
}