const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Experiment = require('../models/Experiment');

// Helper function to save Base64 data URL to physical file in public/uploads
function saveBase64Image(dataString, prefix = 'exp') {
  if (!dataString || typeof dataString !== 'string') return dataString;

  // Check if it's a base64 data URL (e.g. data:image/png;base64,...)
  const matches = dataString.match(/^data:image\/([a-zA-Z0-9+.=-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If it's already a URL or path, return as is
    return dataString;
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Ensure public/uploads directory exists
  const uploadsDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  // Write physical file to filesystem
  fs.writeFileSync(filePath, buffer);

  // Return full static URL path served by Express
  return `http://localhost:3003/uploads/${filename}`;
}

// 0. POST /api/experiments/upload - Upload an image directly and return static URL
router.post('/upload', async (req, res) => {
  try {
    const { image, prefix } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }
    const imageUrl = saveBase64Image(image, prefix || 'img');
    return res.status(200).json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Error uploading image file:', error);
    return res.status(500).json({ success: false, message: 'Failed to save image file on server.' });
  }
});

// 1. GET /api/experiments - Fetch all experiments
router.get('/', async (req, res) => {
  try {
    const experiments = await Experiment.find().sort({ experimentId: 1 });
    return res.status(200).json({
      success: true,
      count: experiments.length,
      experiments,
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch experiments from database.',
    });
  }
});

// 2. GET /api/experiments/:id - Fetch single experiment by ID
router.get('/:id', async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found.' });
    }
    return res.status(200).json({ success: true, experiment });
  } catch (error) {
    console.error('Error fetching experiment details:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching experiment.' });
  }
});

// 3. POST /api/experiments - Create a new experiment
router.post('/', async (req, res) => {
  try {
    const { title, equipment, equipmentImage, principle, principleImage, instructions, experimentId } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Experiment title is required.' });
    }

    // Save physical image files to public/uploads
    const savedEquipmentImg = saveBase64Image(equipmentImage, 'equip');
    const savedPrincipleImg = saveBase64Image(principleImage, 'principle');

    // Determine next experimentId if not supplied
    let newExpId = Number(experimentId);
    if (!newExpId || isNaN(newExpId)) {
      const highestExp = await Experiment.findOne().sort({ experimentId: -1 });
      newExpId = highestExp && highestExp.experimentId ? highestExp.experimentId + 1 : 1;
    }

    // Process instructions (string or array)
    let processedInstructions = [];
    if (Array.isArray(instructions)) {
      processedInstructions = instructions;
    } else if (typeof instructions === 'string') {
      processedInstructions = instructions.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const newExperiment = await Experiment.create({
      experimentId: newExpId,
      title: title.trim(),
      equipment: equipment ? equipment.trim() : '',
      equipmentImage: savedEquipmentImg ? savedEquipmentImg.trim() : '',
      principle: principle ? principle.trim() : '',
      principleImage: savedPrincipleImg ? savedPrincipleImg.trim() : '',
      instructions: processedInstructions,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Experiment created successfully!',
      experiment: newExperiment,
    });
  } catch (error) {
    console.error('Error creating experiment:', error);
    return res.status(500).json({ success: false, message: 'Failed to create experiment.' });
  }
});

// 4. PUT /api/experiments/:id - Update an existing experiment
router.put('/:id', async (req, res) => {
  try {
    const { title, equipment, equipmentImage, principle, principleImage, instructions, experimentId } = req.body;

    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found.' });
    }

    if (title) experiment.title = title.trim();
    if (equipment !== undefined) experiment.equipment = equipment.trim();
    if (equipmentImage !== undefined) {
      experiment.equipmentImage = saveBase64Image(equipmentImage, 'equip');
    }
    if (principle !== undefined) experiment.principle = principle.trim();
    if (principleImage !== undefined) {
      experiment.principleImage = saveBase64Image(principleImage, 'principle');
    }
    if (experimentId) experiment.experimentId = Number(experimentId);

    if (instructions !== undefined) {
      if (Array.isArray(instructions)) {
        experiment.instructions = instructions;
      } else if (typeof instructions === 'string') {
        experiment.instructions = instructions.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    await experiment.save();

    return res.status(200).json({
      success: true,
      message: 'Experiment updated successfully!',
      experiment,
    });
  } catch (error) {
    console.error('Error updating experiment:', error);
    return res.status(500).json({ success: false, message: 'Failed to update experiment.' });
  }
});

// 5. DELETE /api/experiments/:id - Delete an experiment
router.delete('/:id', async (req, res) => {
  try {
    const deletedExp = await Experiment.findByIdAndDelete(req.params.id);
    if (!deletedExp) {
      return res.status(404).json({ success: false, message: 'Experiment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Experiment deleted successfully.',
      experimentId: deletedExp._id,
    });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete experiment.' });
  }
});

module.exports = router;
