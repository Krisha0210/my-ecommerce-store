const { createClient } = require('@supabase/supabase-js');

let supabase;
function getClient() {
  if (!supabase) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return supabase;
}

const supabaseDriver = {
  users: {
    findByEmail: async (email) => {
      const client = getClient();
      const { data, error } = await client.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (error) throw error;
      return data;
    },
    findById: async (id) => {
      const client = getClient();
      const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    create: async (user) => {
      const client = getClient();
      const { error } = await client.from('users').insert(user);
      if (error) throw error;
      return user;
    }
  },
  products: {
    getAll: async (filters = {}) => {
      const client = getClient();
      let query = client.from('products').select('*');
      
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    getById: async (id) => {
      const client = getClient();
      const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    create: async (product) => {
      const client = getClient();
      const { error } = await client.from('products').insert(product);
      if (error) throw error;
      return product;
    },
    update: async (id, updatedProduct) => {
      const client = getClient();
      const { error } = await client.from('products').update(updatedProduct).eq('id', id);
      if (error) throw error;
      return { id, ...updatedProduct };
    },
    delete: async (id) => {
      const client = getClient();
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  carts: {
    getByUserId: async (userId) => {
      const client = getClient();
      const { data, error } = await client.from('carts').select('items').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data ? data.items : [];
    },
    update: async (userId, items) => {
      const client = getClient();
      const { error } = await client.from('carts').upsert({ user_id: userId, items }, { onConflict: 'user_id' });
      if (error) throw error;
      return items;
    }
  },
  orders: {
    create: async (order) => {
      const client = getClient();
      const { id, userId, total, items, shippingAddress, paymentStatus } = order;
      
      const { error } = await client.from('orders').insert({
        id,
        user_id: userId,
        total,
        items,
        shipping_address: shippingAddress,
        payment_status: paymentStatus
      });
      if (error) throw error;

      // Update product stock
      for (const item of items) {
        const { data: product } = await client.from('products').select('stock').eq('id', item.productId).maybeSingle();
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await client.from('products').update({ stock: newStock }).eq('id', item.productId);
        }
      }

      return order;
    },
    getByUserId: async (userId) => {
      const client = getClient();
      const { data, error } = await client.from('orders').select('*').eq('user_id', userId);
      if (error) throw error;
      return data.map(o => ({
        id: o.id,
        userId: o.user_id,
        total: o.total,
        items: o.items,
        shippingAddress: o.shipping_address,
        paymentStatus: o.payment_status,
        createdAt: o.created_at
      }));
    }
  }
};

module.exports = supabaseDriver;
