var curve = 0;
var time;
var deviation = 0;
var fade = 255;
const bass_length = 1;

var synth;

var drum_rnn = new mm.MusicRNN("/checkpoints/soul");
var improv_rnn = new mm.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
var banner, drumsLogo, bassLogo, genreLogo;
var chord_progs, chord_json, current_chord_prog;
var wavSamples;
var pixelSize = 30;

var selectedGenre = 0;
var drumSamples;
var player = new Tone.Player({
  retrigger: true
}).toMaster();

var drum_pattern = [];
var bass_pattern = [];
var wave = [];

var loading = true;
var loadingRoation = 0;
var isPlaying = false;
var released = true;
var bassVolumeSlider;

function playPauseDream() {
  if (isPlaying) {
    Tone.Transport.pause();
  } else {
    playDream();
  }

  isPlaying = !isPlaying;
}

function playDream() {
  var drumPart = new Tone.Part(function(atTime, value){
    try {
      drumSamples.volume.value = drumsVolumeSlider.value() - 100;
      drumSamples.get(value.note).start(atTime);
      if (value.note == 36) {
        wave[3] = {r: 0, g: 0, b: 0};
        wave[4] = {r: 150, g: 150, b: 150};
        wave[5] = {r: 200, g: 200, b: 200};
        wave[6] = {r: 255, g: 255, b: 255};
      }
    } catch(error) {
      console.warn(error.message);
    }
  }, drum_pattern);
  drumPart.loop = true;
  drumPart.start("0");

  var bassPart = new Tone.Part(function(atTime, value) {
    try {
      console.log(value.note, value.duration);
      synth.volume.value = bassVolumeSlider.value() - 100;
      synth.triggerAttackRelease(value.note, value.duration, atTime);
    } catch(error) {
      console.warn(error.message);
    }
  }, bass_pattern);
  bassPart.loop = true;
  bassPart.loopEnd = "2:0:0";
  bassPart.start("0");

  let bpm;
  switch (selectedGenre) {
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

  // AudioContext has to be enabled on the first click on the page
  Tone.Transport.bpm.value = bpm;
  if (Tone.context.state !== "started") {
    Tone.context.resume();
  }

  // start playing
  Tone.Transport.toggle();
}

function mapPitchToNote(pitch) {
  return Tone.Frequency(pitch, "midi").transpose(-24).toFrequency();
}

async function updateSequence() {
  loading = true;
  const sequenceInfo = {
    notes: [42],
    quantizationInfo: { stepsPerQuarter: 4 }
  };
  let dream = await drum_rnn.continueSequence(sequenceInfo, 16, 1.5);
  for (var i = 0; i < dream.notes.length; i++) {
    var time = "0:0:" + (dream.notes[i].quantizedStartStep % 16);
    drum_pattern[i] = {
      note: dream.notes[i].pitch,
      time: time
    };
  }
  console.log(drum_pattern);

  dream = await improv_rnn.continueSequence(
    buildNoteSequence([{ note: 60, time: Tone.now() }]),
    8,
    1.6,
    current_chord_prog
  );
  for (var i = 0; i < dream.notes.length; i++) {
    let startStep = dream.notes[i].quantizedStartStep;
    let time = Math.floor(startStep / 4) +
      ":" + (startStep % 4) + ":0";
    let duration = dream.notes[i].quantizedEndStep - 
      dream.notes[i].quantizedStartStep;

    duration = Math.floor(duration/4) + ":" + duration%4 + ":0";

    bass_pattern[i] = {
      note: mapPitchToNote(dream.notes[i].pitch),
      duration: duration,
      time: time
    };
  }
  console.log(bass_pattern);

  loading = false;
}

function buildNoteSequence(seed) {
  return mm.sequences.quantizeNoteSequence(
    {
      ticksPerQuarter: 220,
      totalTime: seed.length,
      quantizationInfo: {
        stepsPerQuarter: 1
      },
      timeSignatures: [
        {
          time: 0,
          numerator: 4,
          denominator: 4
        }
      ],
      tempos: [
        {
          time: 0,
          qpm: 70
        }
      ],
      notes: seed.map((n, ntime) => ({
        pitch: n.note,
        startTime: ntime * 1.5,
        endTime: (ntime + 1) * 1.5
      }))
    },
    1
  );
}

function soul() {
  drum_rnn = new mm.MusicRNN("/checkpoints/soul");
  selectedGenre = 0;
  Tone.Transport.swing.value = 0.5;
  resetMusic();
  selectWavSamples();
}

function rap() {
  drum_rnn = new mm.MusicRNN("/checkpoints/rap");
  selectedGenre = 1;
  Tone.Transport.swing.value = 0;
  resetMusic();
  selectWavSamples();
}

function rnb() {
  drum_rnn = new mm.MusicRNN("/checkpoints/rnb");
  selectedGenre = 2;
  Tone.Transport.swing.value = 1;
  resetMusic();
  selectWavSamples();
}

function neoSoul() {
  drum_rnn = new mm.MusicRNN("/checkpoints/neo-soul");
  selectedGenre = 3;
  Tone.Transport.swing.value = 1;
  resetMusic();
  selectWavSamples();
}

function resetMusic() {
  isPlaying = false;
  wave = [];
  drum_pattern = [];
  bass_pattern = [];
  current_chord_prog = chord_progs[Math.floor(Math.random() * chord_progs.length)];
  if (Tone.Transport.state == "started")
    Tone.Transport.toggle();
  Tone.Transport.cancel();
  updateSequence();
}

function chordChanged() {
  let chordType = chordOption.value();
  chord_progs = chord_json[chordType];
}

function clearPlayButton() {
  push();
  fill(255);
  noStroke();
  rect(0, 0, 5 * pixelSize, 5 * pixelSize);
  pop();
}

async function setup() {
  canvas = createCanvas(innerWidth, innerHeight);
  frameRate(30);
  rectMode(CENTER, CENTER);
  Tone.Transport.bpm.value = 90;
  curve = 0;
  time = 0;

  banner = loadImage("/images/banner.png");
  drumsLogo = loadImage("/images/drums-logo.png");
  bassLogo = loadImage("/images/bass-logo.png");
  genreLogo = loadImage("/images/genre-logo.png");
  drumsVolumeSlider = createSlider(0, 100, 100, 1);
  bassVolumeSlider = createSlider(0, 100, 80, 1);
  
  chordOption = createSelect();
  chordOption.option("1.4.5");
  chordOption.option("1.5.6.4");
  chordOption.option("1.4.1.5.1");
  chordOption.option("3.6.2.5");
  chordOption.changed(chordChanged);

  await improv_rnn.initialize();

  fetch("/javascripts/chord-progs.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      chord_json = myJson;
      chord_progs = chord_json["3.6.2.5"];
      current_chord_prog = chord_progs[Math.floor(Math.random() * chord_progs.length)];
    });

  fetch("/javascripts/sample-mapping.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      wavSamples = myJson;
      selectWavSamples();
    });

  var comp = new Tone.Compressor(-30, 3).toMaster();

  synth = new Tone.FMSynth({
    "harmonicity": 1,
    "modulationIndex": 2,
    "oscillator": {
      "type": "sine"
    },
    "envelope": {
      "attack" : 0.02,
      "attackCurve": "sine",
    },
    "modulation": {
      "type": "square"
    }
  }).toMaster();
}

function selectWavSamples() {
  drumSamples = new Tone.Players(
    {
      36: wavSamples[selectedGenre][0],
      38: wavSamples[selectedGenre][5],
      42: wavSamples[selectedGenre][2],
      45: wavSamples[selectedGenre][3],
      48: wavSamples[selectedGenre][1],
      49: wavSamples[selectedGenre][7],
      46: wavSamples[selectedGenre][4],
      50: wavSamples[selectedGenre][5],
      51: wavSamples[selectedGenre][6]
    },
    function() {
      updateSequence();
    }
  ).toMaster();
}

function draw() {
  translate(innerWidth / 2, innerHeight / 2);
  textAlign(CENTER, CENTER);

  if (wave.length < innerWidth / pixelSize) {
    wave.unshift({
      r: 0,
      g: 0,
      b: 0
    });
  } else {
    wave.pop();
    wave.unshift({ r: null, g: null, b: null });
  }

  // idea 2 - preserve background and only draw the "beat"
  for (i = 6; i < wave.length; i++) {
    if (wave[i].r != null && wave[i].g != null && wave[i].b != null)
      drawPixelCircle(i, pixelSize, wave[i].r, wave[i].g, wave[i].b);
  }

  time++;
  if (time >= innerWidth / pixelSize) time = 1;

  if (loading) {
    noFill();
    clearPlayButton();
    stroke(0);
    strokeWeight(4);
    arc(0, 0, 100, 100,
      (5 * PI) / 3 + loadingRoation,
      PI / 3 + loadingRoation);

    strokeWeight(1);
    arc(0, 0, 90, 90,
      (5 * PI) / 3 + loadingRoation * (3 / 2),
      PI / 3 + loadingRoation * (3 / 2)
    );
    loadingRoation += PI / 20;
    if (loadingRoation == 3 * TWO_PI) loadingRoation = 0;
  } else {
    push();
    drawPlayPause(pixelSize);
    pop();
  }

  
  // let fps = frameRate();
  // fill(0);
  // stroke(0);
  // text("FPS: " + fps.toFixed(2), -50, 0);

  noStroke();
  textSize(30);
  fill(0, 0, 50);
  textSize(20);

  image(
    banner,
    -banner.width / 4,
    -400,
    banner.width / 2,
    banner.height / 2
  );
  drawControls(selectedGenre);
}

function drawControls(selectedGenre) {
  drumsVolumeSlider.position(innerWidth/2 - bassVolumeSlider.width/2 - 300, innerHeight/2 - 120);
  bassVolumeSlider.position(innerWidth/2 - bassVolumeSlider.width/2 + 300, innerHeight/2 - 120);
  chordOption.position(innerWidth/2 - chordOption.elt.offsetWidth/2 + 300, innerHeight/2 - 90)
  
  image(
    drumsLogo,
    -drumsLogo.width / 4 - 300,
    -150,
    drumsLogo.width / 2,
    drumsLogo.height / 2
  );

  image(
    bassLogo,
    -bassLogo.width / 4 + 300,
    -150,
    bassLogo.width / 2,
    bassLogo.height / 2
  );

  image(
    genreLogo,
    -genreLogo.width / 4,
    220,
    genreLogo.width / 2,
    genreLogo.height / 2
  );

  fill(255);
  text("Bpm: " + Math.floor(Tone.Transport.bpm.value), -300, -75);

  if (selectedGenre == 0) {
    fill(0, 0, 0, 0);
    stroke(255);
    strokeWeight(2);
    rect(-300, 280, 100, 30);
    fill(255);
    noStroke();
    text("Soul", -300, 280);
  } else {
    fill(255);
    rect(-300, 280, 100, 30);
    fill(0, 0, 50);
    text("Soul", -300, 280);
  }

  if (selectedGenre == 1) {
    fill(0, 0, 0, 0);
    stroke(255);
    strokeWeight(2);
    rect(-100, 280, 100, 30);
    fill(255);
    noStroke();
    text("Rap", -100, 280);
  } else {
    fill(255);
    rect(-100, 280, 100, 30);
    fill(0, 0, 50);
    text("Rap", -100, 280);
  }

  if (selectedGenre == 2) {
    fill(0, 0, 0, 0);
    stroke(255);
    strokeWeight(2);
    rect(100, 280, 100, 30);
    fill(255);
    noStroke();
    text("R&B", 100, 280);
  } else {
    fill(255);
    rect(100, 280, 100, 30);
    fill(0, 0, 50);
    text("R&B", 100, 280);
  }

  if (selectedGenre == 3) {
    fill(0, 0, 0, 0);
    stroke(255);
    strokeWeight(2);
    rect(300, 280, 100, 30);
    fill(255);
    noStroke();
    text("Neo-Soul", 300, 280);
  } else {
    fill(255);
    rect(300, 280, 100, 30);
    fill(0, 0, 50);
    text("Neo-Soul", 300, 280);
  }
}

function drawPixelCircle(radius, boxSize, r, g, b) {
  switch (selectedGenre) {
    case 0:
      fill(r, g, 1.5 * radius);
      break;
    case 1:
      fill(r, 1.5 * radius, 1.5 * radius);
      break;
    case 2:
      fill(1.5 * radius, g, b);
      break;
    case 3:
      fill(r, 1.5 * radius, b);
      break;
  }

  strokeWeight(1);
  stroke(255, 255, 255, 50);

  // idea 1 one shape for the whole circle
  if (radius == 1) {
    rect(0, 0, boxSize, boxSize);
  } else {
    for (level = 0; level <= radius; level++) {
      let a = level;
      let b = radius - a;
      if (a * boxSize <= innerWidth / 2 && b * boxSize <= innerWidth / 2) {
        rect(a * boxSize, -b * boxSize, boxSize, boxSize);
        rect(-a * boxSize, -b * boxSize, boxSize, boxSize);
        rect(-b * boxSize, a * boxSize, boxSize, boxSize);
        rect(b * boxSize, a * boxSize, boxSize, boxSize);
      }
    }

    wave[radius] = { r, g, b };
  }
}

function drawAxis() {
  push();
  stroke(255, 0, 0);
  line(0, -innerHeight / 2, 0, innerHeight / 2);
  stroke(0, 0, 255);
  line(-innerWidth / 2, 0, innerWidth / 2, 0);
  pop();
}

function drawPlayPause(boxSize) {
  clearPlayButton();
  noStroke();
  fill(0, 0, 0);

  if (isPlaying) {
    // PAUSE
    rect(+boxSize, -2 * boxSize, boxSize, boxSize);
    rect(+boxSize, -boxSize, boxSize, boxSize);
    rect(+boxSize, 0, boxSize, boxSize);
    rect(+boxSize, +boxSize, boxSize, boxSize);
    rect(+boxSize, +2 * boxSize, boxSize, boxSize);

    rect(-boxSize, 0, boxSize, boxSize);
    rect(-boxSize, +boxSize, boxSize, boxSize);
    rect(-boxSize, -boxSize, boxSize, boxSize);
    rect(-boxSize, -2 * boxSize, boxSize, boxSize);
    rect(-boxSize, +2 * boxSize, boxSize, boxSize);
  } else {
    // PLAY
    rect(0, 0, boxSize, boxSize);
    rect(0, +boxSize, boxSize, boxSize);
    rect(0, -boxSize, boxSize, boxSize);
    rect(0, -2 * boxSize, boxSize, boxSize);
    rect(0, +2 * boxSize, boxSize, boxSize);

    rect(boxSize, 0, boxSize, boxSize);
    rect(boxSize, +boxSize, boxSize, boxSize);
    rect(boxSize, -boxSize, boxSize, boxSize);

    rect(2 * boxSize, 0, boxSize, boxSize);
  }
}

function mouseReleased() {
  released = true;
  return true;
}

// When the user clicks the mouse
function mousePressed() {
  if (!released) {
    return;
  }

  var bound_top;
  var bound_bot;
  var bound_left;
  var bound_right;

  mouseX = mouseX - innerWidth / 2;
  mouseY = mouseY - innerHeight / 2;

  var d = dist(mouseX, mouseY, 0, 0);
  if (d < 3 * pixelSize && !loading) {
    playPauseDream();
  }

  if (!loading) {
    bound_top = 270;
    bound_bot = 300;
    bound_left = -350;
    bound_right = -250;
    if (
      mouseX >= bound_left &&
      mouseX <= bound_right &&
      mouseY >= bound_top &&
      mouseY <= bound_bot
    ) {
      console.log("Soul");
      soul();
    }

    bound_top = 270;
    bound_bot = 300;
    bound_left = -150;
    bound_right = -50;
    if (
      mouseX >= bound_left &&
      mouseX <= bound_right &&
      mouseY >= bound_top &&
      mouseY <= bound_bot
    ) {
      console.log("Rap");
      rap();
    }

    bound_top = 270;
    bound_bot = 300;
    bound_left = 50;
    bound_right = 150;
    if (
      mouseX >= bound_left &&
      mouseX <= bound_right &&
      mouseY >= bound_top &&
      mouseY <= bound_bot
    ) {
      console.log("Rnb");
      rnb();
    }

    bound_top = 270;
    bound_bot = 300;
    bound_left = 250;
    bound_right = 350;
    if (
      mouseX >= bound_left &&
      mouseX <= bound_right &&
      mouseY >= bound_top &&
      mouseY <= bound_bot
    ) {
      console.log("Neo-Soul");
      neoSoul();
    }
  }

  released = false;
}

function keyPressed() {
  if (keyCode == 32) {
    playPauseDream();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  wave = [];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
