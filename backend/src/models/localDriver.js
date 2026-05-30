const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, we will create a base skeleton
    const initialSkeleton = { users: [], products: [], carts: {}, orders: [] };
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialSkeleton, null, 2), 'utf8');
    return initialSkeleton;
  }
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

const localDriver = {
  users: {
    findByEmail: async (email) => {
      const db = await readDb();
      return db.users.find(u => u.email === email.toLowerCase());
    },
    findById: async (id) => {
      const db = await readDb();
      return db.users.find(u => u.id === id);
    },
    create: async (user) => {
      const db = await readDb();
      db.users.push(user);
      await writeDb(db);
      return user;
    }
  },
  products: {
    getAll: async (filters = {}) => {
      const db = await readDb();
      let products = db.products || [];
      if (filters.category && filters.category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }
      if (filters.minPrice) {
        products = products.filter(p => p.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
      }
      return products;
    },
    getById: async (id) => {
      const db = await readDb();
      return db.products.find(p => p.id === id);
    },
    create: async (product) => {
      const db = await readDb();
      db.products.push(product);
      await writeDb(db);
      return product;
    },
    update: async (id, updatedProduct) => {
      const db = await readDb();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx > -1) {
        db.products[idx] = { ...db.products[idx], ...updatedProduct };
        await writeDb(db);
        return db.products[idx];
      }
      return null;
    },
    delete: async (id) => {
      const db = await readDb();
      const initialLength = db.products.length;
      db.products = db.products.filter(p => p.id !== id);
      await writeDb(db);
      return db.products.length < initialLength;
    }
  },
  carts: {
    getByUserId: async (userId) => {
      const db = await readDb();
      return db.carts[userId] || [];
    },
    update: async (userId, items) => {
      const db = await readDb();
      db.carts[userId] = items;
      await writeDb(db);
      return items;
    }
  },
  orders: {
    create: async (order) => {
      const db = await readDb();
      db.orders.push(order);
      // Reduce product stock
      for (const item of order.items) {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
      await writeDb(db);
      return order;
    },
    getByUserId: async (userId) => {
      const db = await readDb();
      return db.orders.filter(o => o.userId === userId);
    }
  },
  websiteReviews: {
    getAll: async () => {
      const db = await readDb();
      return db.websiteReviews || [];
    },
    create: async (review) => {
      const db = await readDb();
      if (!db.websiteReviews) db.websiteReviews = [];
      db.websiteReviews.push(review);
      await writeDb(db);
      return review;
    }
  }
};

module.exports = localDriver;
