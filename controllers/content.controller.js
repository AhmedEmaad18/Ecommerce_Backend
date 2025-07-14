const Content = require('../Models/content.model');

// Get About Us content
exports.getAbout = async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) {
      content = await Content.create({});
    }
    res.json({ aboutText: content.aboutText });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.createAbout = async (req, res) => {
  try {
    const { aboutText } = req.body;

    // Check if About Us already exists to prevent duplicates
    const existing = await Content.findOne({ type: 'about' });
    if (existing) {
      return res.status(400).json({ message: 'About Us content already exists.' });
    }

    const about = new Content({
      type: 'about',
      aboutText
    });

    await about.save();

    res.status(201).json({
      message: 'About Us created successfully.',
      about
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update About Us content
exports.updateAbout = async (req, res) => {
  try {
    const { aboutText } = req.body;
    let content = await Content.findOne();
    if (!content) {
      content = new Content();
    }
    content.aboutText = aboutText;
    await content.save();
    res.json({ message: 'About Us updated', aboutText: content.aboutText });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
