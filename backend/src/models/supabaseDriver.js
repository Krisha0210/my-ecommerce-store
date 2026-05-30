const supabase = require('../config/supabaseClient');

const supabaseDriver = {
  users: {
    findByEmail: async (email) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        createdAt: data.created_at
      };
    },
    findById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        createdAt: data.created_at
      };
    },
    create: async (user) => {
      const { id, name, email, password } = user;
      const { error } = await supabase
        .from('users')
        .insert({
          id,
          name,
          email: email.toLowerCase(),
          password
        });
      if (error) throw error;
      return user;
    }
  },
  products: {
    getAll: async (filters = {}) => {
      let query = supabase.from('products').select('*');
      
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
      
      const { v5: uuidv5 } = require('uuid');
      const UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
      const featuredUuids = ['prod_1', 'prod_2', 'prod_3', 'prod_6', 'prod_9', 'prod_11', 'prod_12', 'prod_13', 'prod_14'].map(id => uuidv5(id, UUID_NAMESPACE));

      return (data || []).map(p => ({
        ...p,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        rating: parseFloat(p.rating || 5.0),
        featured: p.featured !== undefined ? p.featured : featuredUuids.includes(p.id)
      }));
    },
    getById: async (id) => {
      // 1. Fetch product fields
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (prodError) throw prodError;
      if (!product) return null;

      // 2. Fetch reviews from the relational 'reviews' table, joining users table to retrieve names
      const { data: reviews, error: revError } = await supabase
        .from('reviews')
        .select('*, users(name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
        
      if (revError) {
        console.warn('Warning: Failed to fetch product reviews:', revError.message);
      }

      const { v5: uuidv5 } = require('uuid');
      const UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
      const featuredUuids = ['prod_1', 'prod_2', 'prod_3', 'prod_6', 'prod_9', 'prod_11', 'prod_12', 'prod_13', 'prod_14'].map(id => uuidv5(id, UUID_NAMESPACE));

      const averageRating = reviews && reviews.length > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : parseFloat(product.rating || 5.0);

      return {
        ...product,
        images: product.images && product.images.length > 0 ? product.images : [product.image],
        rating: averageRating,
        featured: product.featured !== undefined ? product.featured : featuredUuids.includes(product.id),
        reviews: reviews ? reviews.map(r => ({
          id: r.id,
          userName: r.users ? r.users.name : (r.user_name || 'Anonymous User'),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at || r.createdAt
        })) : []
      };
    },
    create: async (product) => {
      const { reviews, images, rating, featured, ...prodFields } = product;
      const { error } = await supabase
        .from('products')
        .insert(prodFields);
      if (error) throw error;

      // Seed reviews if any exist on creation
      if (reviews && reviews.length > 0) {
        const rows = reviews.map(r => ({
          id: r.id,
          product_id: product.id,
          user_id: r.userId || r.user_id || '00000000-0000-0000-0000-000000000000',
          rating: r.rating,
          comment: r.comment,
          created_at: r.createdAt
        }));
        await supabase.from('reviews').insert(rows);
      }

      return product;
    },
    update: async (id, updatedProduct) => {
      const { reviews, images, rating, featured, ...productFields } = updatedProduct;

      // If review edits are present (adding a review via product rating change), insert the review
      if (reviews && reviews.length > 0) {
        const latestReview = reviews[reviews.length - 1];
        
        // Double check it doesn't exist before inserting
        const { data: exists } = await supabase
          .from('reviews')
          .select('id')
          .eq('id', latestReview.id)
          .maybeSingle();
           
        if (!exists) {
          const { error: revError } = await supabase
            .from('reviews')
            .insert({
              id: latestReview.id,
              product_id: id,
              user_id: latestReview.userId || latestReview.user_id || '00000000-0000-0000-0000-000000000000',
              rating: latestReview.rating,
              comment: latestReview.comment,
              created_at: latestReview.createdAt
            });
          if (revError) {
            console.error('Error inserting review to relational reviews table:', revError.message);
          }
        }
      }

      // Update products details (excluding reviews nested data field, rating, featured, images)
      if (Object.keys(productFields).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(productFields)
          .eq('id', id);
        if (error) throw error;
      }
      return { id, ...updatedProduct };
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  carts: {
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('cart')
        .select('product_id, quantity, products(name, price, image)')
        .eq('user_id', userId);
      if (error) throw error;
      if (!data) return [];
      
      return data.map(item => ({
        productId: item.product_id,
        name: item.products ? item.products.name : '',
        price: item.products ? parseFloat(item.products.price) : 0,
        image: item.products ? item.products.image : '',
        quantity: item.quantity
      }));
    },
    update: async (userId, items) => {
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);
      if (deleteError) throw deleteError;

      if (items.length > 0) {
        const { v4: uuidv4 } = require('uuid');
        const rows = items.map(item => ({
          id: uuidv4(),
          user_id: userId,
          product_id: item.productId,
          quantity: item.quantity
        }));
        const { error: insertError } = await supabase
          .from('cart')
          .insert(rows);
        if (insertError) throw insertError;
      }
      return items;
    }
  },
  orders: {
    create: async (order) => {
      const { id, userId, total, items, shippingAddress, paymentStatus, status } = order;
      const { v4: uuidv4 } = require('uuid');
      
      // 1. Insert order record (excluding items array column and payment_status)
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id,
          user_id: userId,
          total,
          shipping_address: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
          status: status || 'Pending'
        });
      if (orderError) throw orderError;

      // 2. Insert items into order_items table
      const orderItemsRows = items.map(item => ({
        id: uuidv4(),
        order_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsRows);
      if (itemsError) throw itemsError;

      // 3. Decrement stock
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .maybeSingle();
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      }

      return order;
    },
    getByUserId: async (userId) => {
      // Fetch orders and run inner joins on order_items and products
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, image))')
        .eq('user_id', userId);
      if (error) throw error;
      if (!data) return [];
      
      return data.map(o => ({
        id: o.id,
        userId: o.user_id,
        total: parseFloat(o.total),
        shippingAddress: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
        status: o.status,
        paymentStatus: 'Paid',
        createdAt: o.created_at,
        items: o.order_items ? o.order_items.map(item => ({
          productId: item.product_id,
          name: item.products ? item.products.name : '',
          price: parseFloat(item.price),
          image: item.products ? item.products.image : '',
          quantity: item.quantity
        })) : []
      }));
    }
  },
  websiteReviews: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase testimonials error, returning empty list:', error.message);
        return [];
      }
      if (!data) return [];
      
      return data.map(r => ({
        id: r.id,
        userName: r.user_name || r.userName,
        rating: r.rating,
        comment: r.message || r.comment,
        createdAt: r.created_at || r.createdAt
      }));
    },
    create: async (review) => {
      const { id, userName, rating, comment, createdAt } = review;
      const { error } = await supabase
        .from('testimonials')
        .insert({
          id,
          user_name: userName,
          rating,
          message: comment,
          created_at: createdAt
        });
      if (error) throw error;
      return review;
    }
  }
};

module.exports = supabaseDriver;
