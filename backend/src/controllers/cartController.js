const dbDriver = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const items = await dbDriver.carts.getByUserId(req.user.id);
    res.json({ items });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Server error retrieving cart.' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array.' });
    }
    const updatedItems = await dbDriver.carts.update(req.user.id, items);
    res.json({ items: updatedItems });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart.' });
  }
};
