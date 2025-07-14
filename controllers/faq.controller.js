const FAQ = require('../Models/faq.model');
// Admin submits FAQ with question + answer
exports.adminSubmitFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const adminId = req.user._id;

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return res.status(400).json({ message: 'Question must be at least 5 characters.' });
    }

    if (!answer || typeof answer !== 'string' || answer.trim().length < 5) {
      return res.status(400).json({ message: 'Answer must be at least 5 characters.' });
    }

    const faq = new FAQ({
      user: adminId,
      question: question.trim(),
      answer: answer.trim(),
      answeredAt: new Date(),
    });

    await faq.save();

    res.status(201).json({ message: 'FAQ submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit FAQ.', error: err.message });
  }
};
// Controller function to get all FAQs (for admin)
exports.getAllFaqsForAdmin = async (req, res) => {
  try {
    // Fetch all FAQs, populate user info (name, email), sorted by creation date descending
    const faqs = await FAQ.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQs.', error: err.message });
  }
};
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required.' });
    }

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, answeredAt: new Date() },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ updated successfully', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getFaqById = async (req, res) => {
  try {
    const faqId = req.params.id;

    const faq = await FAQ.findById(faqId).populate('user', 'name email');
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    res.status(200).json(faq);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQ.', error: err.message });
  }
};
// Delete FAQ by ID
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};