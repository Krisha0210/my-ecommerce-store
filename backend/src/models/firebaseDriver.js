const admin = require('firebase-admin');

let db;
// Initialize Firebase admin only if configurations exist
function getDb() {
  if (!db) {
    if (admin.apps.length === 0) {
      const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
      let serviceAccount = null;
      
      if (serviceAccountEnv) {
        try {
          serviceAccount = JSON.parse(serviceAccountEnv);
        } catch (e) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
        }
      }

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Fallback to default credentials in the environment
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
    }
    db = admin.firestore();
  }
  return db;
}

const firebaseDriver = {
  users: {
    findByEmail: async (email) => {
      const firestore = getDb();
      const snapshot = await firestore.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    findById: async (id) => {
      const firestore = getDb();
      const doc = await firestore.collection('users').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    },
    create: async (user) => {
      const firestore = getDb();
      const { id, ...userData } = user;
      await firestore.collection('users').doc(id).set(userData);
      return user;
    }
  },
  products: {
    getAll: async (filters = {}) => {
      const firestore = getDb();
      let query = firestore.collection('products');
      
      if (filters.category && filters.category !== 'All') {
        query = query.where('category', '==', filters.category);
      }
      
      const snapshot = await query.get();
      let products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });

      // Post-process with in-memory filtering for compound searches to avoid Firebase index restrictions
      if (filters.search) {
        const q = filters.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
      const firestore = getDb();
      const doc = await firestore.collection('products').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    },
    create: async (product) => {
      const firestore = getDb();
      const { id, ...data } = product;
      await firestore.collection('products').doc(id).set(data);
      return product;
    },
    update: async (id, updatedProduct) => {
      const firestore = getDb();
      await firestore.collection('products').doc(id).update(updatedProduct);
      return { id, ...updatedProduct };
    },
    delete: async (id) => {
      const firestore = getDb();
      await firestore.collection('products').doc(id).delete();
      return true;
    }
  },
  carts: {
    getByUserId: async (userId) => {
      const firestore = getDb();
      const doc = await firestore.collection('carts').doc(userId).get();
      if (!doc.exists) return [];
      return doc.data().items || [];
    },
    update: async (userId, items) => {
      const firestore = getDb();
      await firestore.collection('carts').doc(userId).set({ items });
      return items;
    }
  },
  orders: {
    create: async (order) => {
      const firestore = getDb();
      const batch = firestore.batch();
      
      // Save order
      const orderRef = firestore.collection('orders').doc(order.id);
      const { id, ...orderData } = order;
      batch.set(orderRef, orderData);

      // Decrement product stock
      for (const item of order.items) {
        const prodRef = firestore.collection('products').doc(item.productId);
        batch.update(prodRef, {
          stock: admin.firestore.FieldValue.increment(-item.quantity)
        });
      }
      
      await batch.commit();
      return order;
    },
    getByUserId: async (userId) => {
      const firestore = getDb();
      const snapshot = await firestore.collection('orders').where('userId', '==', userId).get();
      let orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    }
  }
};

module.exports = firebaseDriver;
