# BitsOfBeats

An AI-powered beat generation web application that uses machine learning to generate unique musical beats for free. Practice your lyrics over fresh beats generated on demand without the need for paid samples.

## About

BitsOfBeats is a web application that leverages TensorFlow and Google's Magenta project to generate original beat compositions using recurrent neural networks (RNN). Each beat is unique and generated in real-time, perfect for practicing freestyle lyrics or testing musical ideas.

**Project Details:**
- 3rd Year University Project - University of Manchester
- Author: Octavian Taranu Toma
- Project Supervisor: Toby Howard

## Features

- **AI Beat Generation**: Uses MusicRNN model trained on various music datasets (Soul, R&B, Rap, Neo-Soul)
- **Real-time Generation**: Generate unique beats with each button press
- **Free to Use**: No paid samples required
- **Web-based Interface**: Accessible via browser using p5.js for interactive visualization
- **MIDI Support**: Integrates with MIDI playback and continuation

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **Jade** (Pug) template engine
- **Morgan** for HTTP request logging
- Express SEO middleware

### Frontend
- **p5.js** for interactive visualization
- **JavaScript** for client-side logic
- **MIDI.js** for audio playback

### Machine Learning
- **TensorFlow** for model inference
- **Google Magenta** MusicRNN model
- **Python** scripts for model conversion and training

## Project Structure

```
BitsOfBeats/
├── app.js                    # Main Express application
├── config.json               # MusicRNN model configuration
├── package.json              # Node.js dependencies
├── bin/                      # Server startup scripts
├── routes/                   # Express route handlers
│   ├── index.js              # Home page route
│   └── sitemap.js            # Sitemap route
├── views/                    # Jade templates
├── public/                   # Static assets
│   ├── javascripts/          # Client-side JS
│   │   ├── sketch.js         # p5.js main sketch
│   │   ├── midi-continue.js  # MIDI generation logic
│   │   └── vendor/           # Third-party libraries
│   ├── stylesheets/          # CSS files
│   ├── sounds/               # Audio samples
│   ├── images/               # Images and assets
│   └── checkpoints/          # TensorFlow model checkpoints
├── soul-model/               # Pre-trained model data
└── training-data/            # CSV datasets for training
```

## Installation

### Prerequisites
- Node.js (v10 or higher)
- Python 3.5+ (for TensorFlow utilities)
- TensorFlow.js
- tensorflowjs Python package (for model conversion)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/toctavian/BitsOfBeats.git
cd BitsOfBeats
```

2. Install Node.js dependencies:
```bash
npm install
```

3. (Optional) For model conversion, install Python dependencies:
```bash
pip install tensorflow tensorflowjs
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## 📊 Training Data

The model is trained on various music genres:
- `soul-songs.csv` - Soul music patterns
- `rnb-songs.csv` - R&B music patterns
- `rap-songs.csv` - Rap beat patterns
- `neo-soul-songs.csv` - Neo-soul music patterns

## 🔨 Development Tools

### Model Conversion
Two Python scripts are provided for TensorFlow checkpoint conversion:
- `checkpoint_converter.py` - Converts TensorFlow checkpoints to TensorFlow.js format
- `merger.py` - Alternative checkpoint conversion tool

Usage:
```bash
python checkpoint_converter.py /path/to/checkpoint.ckpt /path/to/output \
  --remove_variables_regex='.*Adam.*|beta.*_power'
```

## License

This project includes code from:
- TensorFlow (Apache License 2.0)
- Google Magenta (Apache License 2.0)

## Links

- [GitHub Repository](https://github.com/toctavian/BitsOfBeats)
- [Live Demo](https://bitsofbeats.com) *(if applicable)*

## Acknowledgments

- Google TensorFlow team
- Google Magenta project
- University of Manchester
- Toby Howard (Project Supervisor)

---

**Note**: Now there's a way to practice those fire lyrics without the need of paid samples. This AI generates pieces of beats, new with each generation, for free.

*Acum ai șansa să exersezi versurile alea blanao pe care le-ai păstrat pentru viitoarele producții. Inteligența artificială integrată în acest site îți oferă beaturi noi la fiecare apăsare de buton.*
