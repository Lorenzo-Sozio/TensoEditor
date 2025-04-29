// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/models', express.static(path.join(__dirname, 'public/models')));


// Configurazione upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/models/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Leggi il catalogo
app.get('/api/catalogo', (req, res) => {
  try {
    const catalog = JSON.parse(fs.readFileSync('data/catalogo.json', 'utf8'));
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel caricamento del catalogo' });
  }
});

// Aggiorna il catalogo
app.post('/api/catalogo', (req, res) => {
  try {
    fs.writeFileSync('data/catalog.json', JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel salvataggio del catalogo' });
  }
});

// Carica un modello GLB
app.post('/api/models/upload', upload.single('model'), (req, res) => {
  res.json({ 
    path: `/models/${req.file.filename}`,
    success: true 
  });
});

// Add new endpoint to get model info
app.get('/api/models/:id', (req, res) => {
  console.log('Received request for model info:', req.params.id);
  const modelId = req.params.id;
  const modelPath = path.join(__dirname, 'public/models', `${modelId}.glb`);

  if (fs.existsSync(modelPath)) {
    res.json({
      id: modelId,
      url: `/models/${modelId}.glb`,
      exists: true
    });
  } else {
    res.status(404).json({
      error: 'Model not found',
      id: modelId,
      exists: false
    });
  }
});


// Salva una configurazione
app.post('/api/configurations', (req, res) => {
  try {
    const id = req.body.id || `config_${Date.now()}`;
    const filePath = `data/configurations/${id}.json`;
    
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ id, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel salvataggio della configurazione' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});