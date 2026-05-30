const { v4: uuidv4 } = require('uuid');
const dbDriver = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const products = await dbDriver.products.getAll({ category, search, minPrice, maxPrice });
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await dbDriver.products.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch product by ID error:', error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const products = await dbDriver.products.getAll();
    const categories = ['All', ...new Set(products.map(p => p.category))];
    res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, images, stock, featured } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: 'Name, description, price, category, and main image are required.' });
    }

    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      images: Array.isArray(images) && images.length > 0 ? images : [image],
      rating: 5.0, // Default for new products
      stock: parseInt(stock) || 0,
      featured: featured || false
    };

    const product = await dbDriver.products.create(newProduct);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, images, stock, featured } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (price !== undefined) fieldsToUpdate.price = parseFloat(price);
    if (category !== undefined) fieldsToUpdate.category = category;
    if (image !== undefined) fieldsToUpdate.image = image;
    if (images !== undefined) fieldsToUpdate.images = Array.isArray(images) ? images : [image];
    if (stock !== undefined) fieldsToUpdate.stock = parseInt(stock);
    if (featured !== undefined) fieldsToUpdate.featured = featured;

    const updated = await dbDriver.products.update(req.params.id, fieldsToUpdate);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await dbDriver.products.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};
