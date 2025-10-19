# Memory Optimization Report - BitsOfBeats

## Executive Summary
This report identifies potential memory optimizations for the BitsOfBeats application to reduce RAM usage during operation.

## Current Memory Usage Patterns

### 1. **Frontend (sketch.js)**
The main application uses p5.js and maintains several memory-intensive structures:
- `wave[]` array that grows up to `innerWidth / pixelSize` elements
- Multiple Tone.js audio players and synthesizers
- Image assets loaded into memory
- MusicRNN models loaded in browser

### 2. **Machine Learning Models**
- Multiple MusicRNN models loaded simultaneously (soul, rap, rnb, neo-soul checkpoints)
- Improv RNN model loaded from external URL
- TensorFlow.js runtime overhead

---

## 🔴 Critical Memory Issues

### Issue 1: Unbounded Wave Array Growth
**Location:** `sketch.js` lines 330-339

**Problem:**
```javascript
if (wave.length < innerWidth / pixelSize) {
  wave.unshift({r: 0, g: 0, b: 0});
} else {
  wave.pop();
  wave.unshift({ r: null, g: null, b: null });
}
```

The `wave` array is constantly manipulated with `unshift()` and `pop()`, which causes memory reallocation on every frame (30 fps).

**Memory Impact:** High - Array manipulation every 33ms

**Recommendation:**
- Use a circular buffer instead of array shift/unshift operations
- Pre-allocate the array to maximum size
- Use index pointer to track position

**Optimized Code:**
```javascript
// At initialization
let waveMaxSize = Math.ceil(innerWidth / pixelSize);
let wave = new Array(waveMaxSize).fill({r: null, g: null, b: null});
let waveIndex = 0;

// In draw loop (replace lines 330-339)
wave[waveIndex] = {r: null, g: null, b: null};
waveIndex = (waveIndex + 1) % waveMaxSize;
```

---

### Issue 2: Multiple RNN Models Loaded Simultaneously
**Location:** `sketch.js` lines 9-12

**Problem:**
All genre models are loaded into memory, but only one is used at a time.

**Memory Impact:** Very High - Each model is 10-50MB

**Recommendation:**
- Load only the active genre model
- Unload previous model before loading new one
- Show loading indicator during model switch

**Optimized Code:**
```javascript
// Remove global model initialization
// var drum_rnn = new mm.MusicRNN("/checkpoints/soul");

// Add lazy loading
let drum_rnn = null;
let currentModelPath = null;

async function loadDrumModel(modelPath) {
  if (currentModelPath === modelPath && drum_rnn) {
    return; // Already loaded
  }
  
  // Dispose old model
  if (drum_rnn) {
    drum_rnn.dispose();
  }
  
  loading = true;
  drum_rnn = new mm.MusicRNN(modelPath);
  await drum_rnn.initialize();
  currentModelPath = modelPath;
  loading = false;
}

// Update genre functions
function soul() {
  loadDrumModel("/checkpoints/soul").then(() => {
    selectedGenre = 0;
    Tone.Transport.swing.value = 0.5;
    resetMusic();
    selectWavSamples();
  });
}
```

---

### Issue 3: Audio Sample Memory Leaks
**Location:** `sketch.js` lines 307-324

**Problem:**
New `Tone.Players` created each time genre changes without disposing old ones.

**Memory Impact:** High - Audio buffers are not garbage collected

**Recommendation:**
- Dispose old players before creating new ones
- Reuse player instances when possible

**Optimized Code:**
```javascript
function selectWavSamples() {
  // Dispose old samples
  if (drumSamples) {
    drumSamples.dispose();
  }
  
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
```

---

### Issue 4: Tone.js Part Memory Leaks
**Location:** `sketch.js` lines 44-73

**Problem:**
New `Tone.Part` instances created on every play without disposal.

**Memory Impact:** Medium - Accumulates over multiple play sessions

**Recommendation:**
- Store references to parts
- Dispose parts when creating new ones

**Optimized Code:**
```javascript
let drumPart = null;
let bassPart = null;

function playDream() {
  wave = [];
  
  // Dispose old parts
  if (drumPart) {
    drumPart.dispose();
  }
  if (bassPart) {
    bassPart.dispose();
  }
  
  drumPart = new Tone.Part(function(atTime, value){
    // ... existing code
  }, drum_pattern);
  drumPart.loop = true;
  drumPart.start("0");

  bassPart = new Tone.Part(function(atTime, value) {
    // ... existing code
  }, bass_pattern);
  bassPart.loop = true;
  bassPart.loopEnd = "2:0:0";
  bassPart.start("0");
  
  // ... rest of function
}
```

---

### Issue 5: Redundant Image Redraws
**Location:** `sketch.js` lines 383-420

**Problem:**
Static images (banner, logos) are redrawn every frame (30 fps).

**Memory Impact:** Low RAM, High CPU (but affects overall performance)

**Recommendation:**
- Use p5.js graphics buffer for static elements
- Only redraw when necessary

**Optimized Code:**
```javascript
let staticGraphics;

function setup() {
  // ... existing setup code
  
  // Create buffer for static elements
  staticGraphics = createGraphics(innerWidth, innerHeight);
  drawStaticElements(staticGraphics);
}

function drawStaticElements(g) {
  g.image(banner, g.width/2 - banner.width/4, g.height/2 - 400, banner.width/2, banner.height/2);
  g.image(genreLogo, g.width/2 - genreLogo.width/4, g.height/2 + 220, genreLogo.width/2, genreLogo.height/2);
  // ... other static elements
}

function draw() {
  // Draw static buffer
  image(staticGraphics, -innerWidth/2, -innerHeight/2);
  
  // Only draw dynamic elements
  // ... rest of draw code
}
```

---

## 🟡 Medium Priority Optimizations

### Issue 6: midi-continue.js - Synth Accumulation
**Location:** `midi-continue.js` lines 222-231

**Problem:**
Synths created but disposal is delayed by 2 seconds, can accumulate during rapid playing.

**Recommendation:**
- Implement object pooling for synths
- Reduce disposal timeout to 500ms

---

### Issue 7: Generated Sequence Array Growth
**Location:** `midi-continue.js` lines 164-178

**Problem:**
`generatedSequence` array keeps growing and concatenating.

**Recommendation:**
- Set maximum length limit (e.g., 100 notes)
- Shift old notes when limit reached

---

## 🟢 Low Priority Optimizations

### Issue 8: Node.js Backend
**Location:** `app.js`

**Current State:** Backend is lightweight, no significant memory issues detected.

**Potential Improvements:**
- Enable gzip compression for static assets
- Implement caching headers for checkpoints and static files
- Consider serving models from CDN to reduce server memory

---

## Implementation Priority

### Phase 1 (Immediate - High Impact)
1. ✅ Fix wave array with circular buffer
2. ✅ Implement lazy model loading
3. ✅ Fix audio sample disposal

### Phase 2 (Short-term)
4. ✅ Fix Tone.Part memory leaks
5. ✅ Optimize static image rendering

### Phase 3 (Long-term)
6. Implement synth pooling
7. Add sequence length limits
8. Backend optimizations

---

## Expected Memory Savings

| Optimization | Estimated RAM Saved | Implementation Difficulty |
|-------------|--------------------|-----------------------------|
| Wave array fix | 5-10 MB | Easy |
| Model lazy loading | 40-150 MB | Medium |
| Audio sample disposal | 20-50 MB | Easy |
| Tone.Part disposal | 10-30 MB | Easy |
| Static graphics buffer | Minimal RAM, CPU gains | Medium |

**Total Potential Savings: 75-240 MB** (30-60% reduction depending on usage patterns)

---

## Testing Recommendations

1. Use Chrome DevTools Memory Profiler to track heap allocations
2. Test with different screen sizes (wave array scales with screen width)
3. Monitor memory during genre switches
4. Test prolonged usage (1+ hour sessions)
5. Profile on mobile devices for memory constraints

---

## Additional Recommendations

1. **Add memory monitoring:** Implement `performance.memory` API to track usage
2. **Lazy load audio samples:** Load samples on-demand instead of all at once
3. **Implement service worker:** Cache static assets and models for offline use
4. **Consider WebAssembly:** For TensorFlow.js backend to reduce memory overhead
5. **Add cleanup on page unload:** Properly dispose all resources when user leaves

---

*Report generated: 2025-10-19*
*Project: BitsOfBeats v1.0.0*
