const { v5: uuidv5 } = require('uuid');
const supabase = require('./supabaseClient');
require('dotenv').config();

const UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
function getUuid(prodId) {
  return uuidv5(prodId, UUID_NAMESPACE);
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const mockProducts = [
  {
    id: "prod_1",
    name: "NovaSound Elite Wireless Headphones",
    description: "Experience pure sound purity with active noise-canceling technology, 40-hour battery life, and ergonomic memory foam earcups for all-day luxury listening.",
    price: 299.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    stock: 25,
    featured: true,
    reviews: [
      {
        id: "rev_1_1",
        userName: "Sophia Vance",
        rating: 5,
        comment: "Absolutely incredible sound stage. The active noise canceling blocks out everything in the subway. Highly recommend!",
        createdAt: "2026-05-28T10:15:30Z"
      },
      {
        id: "rev_1_2",
        userName: "David Miller",
        rating: 4,
        comment: "Very comfortable for long flights. The battery life is closer to 38 hours in my tests, which is still phenomenal.",
        createdAt: "2026-05-29T14:22:10Z"
      }
    ]
  },
  {
    id: "prod_2",
    name: "Chronograph Classic Leather Watch",
    description: "A timeless watch featuring a genuine Italian leather strap, stainless steel casing, Japanese quartz movement, and water resistance up to 50 meters.",
    price: 189.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 15,
    featured: true,
    reviews: [
      {
        id: "rev_2_1",
        userName: "Elena Rostova",
        rating: 5,
        comment: "Looks extremely premium on the wrist. The leather strap is softening nicely with daily wear. Keeps perfect time.",
        createdAt: "2026-05-27T08:45:00Z"
      }
    ]
  },
  {
    id: "prod_3",
    name: "AeroStep Ergonomic Office Chair",
    description: "Upgrade your workspace with adaptive lumbar support, breathable mesh back, adjustable 3D armrests, and a pneumatic smooth height adjustment system.",
    price: 349.50,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1688554271810-745a3cefc755?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 10,
    featured: true,
    reviews: [
      {
        id: "rev_3_1",
        userName: "Liam O'Connor",
        rating: 5,
        comment: "My lower back pain vanished after two days of using this. The mesh is supportive and very cool during hot afternoons.",
        createdAt: "2026-05-25T11:30:15Z"
      }
    ]
  },
  {
    id: "prod_4",
    name: "PulseFit Active Smart Watch",
    description: "Track your heart rate, sleep cycles, steps, and workouts automatically. Features a vibrant AMOLED display, integrated GPS, and a sleek waterproof body.",
    price: 149.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 40,
    featured: false,
    reviews: []
  },
  {
    id: "prod_5",
    name: "Minimalist Canvas Everyday Backpack",
    description: "Crafted from water-repellent organic cotton canvas. Features a padded 16-inch laptop compartment, hidden security pockets, and magnetic leather strap closures.",
    price: 85.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 30,
    featured: false,
    reviews: []
  },
  {
    id: "prod_6",
    name: "PureBrew Smart Drip Coffee Maker",
    description: "Program your perfect morning cup with custom brew strength controls, built-in bean grinder, and temperature-controlled stainless steel thermal carafe.",
    price: 119.99,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 8,
    featured: true,
    reviews: [
      {
        id: "rev_6_1",
        userName: "Grace Miller",
        rating: 5,
        comment: "The grinder is surprisingly quiet and the thermal carafe keeps the coffee hot for hours without burning it. Absolutely love it.",
        createdAt: "2026-05-29T07:12:44Z"
      }
    ]
  },
  {
    id: "prod_7",
    name: "FlexiCore Non-Slip Yoga Mat",
    description: "Eco-friendly natural rubber base with a high-grip polyurethane surface layer. 6mm thick cushioning protects joints during intense sessions.",
    price: 65.00,
    category: "Sports & Fitness",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 50,
    featured: false,
    reviews: []
  },
  {
    id: "prod_8",
    name: "AeroGrip Performance Running Shoes",
    description: "Lightweight, breathable knit mesh upper combined with responsive foam mid-sole cushioning and a durable grip rubber sole for effortless runs.",
    price: 125.00,
    category: "Sports & Fitness",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 20,
    featured: false,
    reviews: []
  },
  {
    id: "prod_9",
    name: "Quantum High-Fidelity Soundbar",
    description: "Immerse yourself in theater-quality audio. Features 3D Dolby Atmos surround virtualization, wireless active subwoofer, and Bluetooth stream casting.",
    price: 249.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 18,
    featured: true,
    reviews: []
  },
  {
    id: "prod_10",
    name: "AuraGlow Smart LED Desk Lamp",
    description: "Optimize your work productivity. Features voice controls, adjustable color temperatures (2700K - 6500K), adaptive auto-brightness, and a built-in Qi wireless phone charger.",
    price: 79.99,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 35,
    featured: false,
    reviews: []
  },
  {
    id: "prod_11",
    name: "Nomad Water-Resistant Duffel Bag",
    description: "The ultimate travel companion. Constructed from TPU-coated 840D nylon, waterproof zippers, convertible padded backpack straps, and a separate shoe compartment.",
    price: 110.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 12,
    featured: true,
    reviews: []
  },
  {
    id: "prod_12",
    name: "IronGrip Adjustable Dumbbells",
    description: "Consolidate 15 weights into a single pair. Effortlessly select loads from 5 to 52.5 lbs using a tactile selection dial. Built with heavy-duty steel molds.",
    price: 199.99,
    category: "Sports & Fitness",
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 6,
    featured: true,
    reviews: []
  },
  {
    id: "prod_13",
    name: "Design Systems for the Web",
    description: "A comprehensive guide on design systems, atomic layouts, CSS custom properties, and building scalable component libraries for front-end architecture.",
    price: 45.00,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    stock: 20,
    featured: true,
    reviews: [
      {
        id: "rev_13_1",
        userName: "Clara Adams",
        rating: 5,
        comment: "Excellent diagrams and case studies. Every front-end engineer should have a copy of this book on their desk.",
        createdAt: "2026-05-20T11:10:00Z"
      },
      {
        id: "rev_13_2",
        userName: "Nate Rogers",
        rating: 4,
        comment: "Very solid introduction to layout tokens. Wish it had more React-specific structure, but concepts are timeless.",
        createdAt: "2026-05-24T09:15:30Z"
      }
    ]
  },
  {
    id: "prod_14",
    name: "The Art of Clean Coding",
    description: "Deep dive into structural refactoring patterns, coding standards, test-driven development, and clean functional programming strategies in modern languages.",
    price: 39.99,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 5.0,
    stock: 15,
    featured: true,
    reviews: [
      {
        id: "rev_14_1",
        userName: "Brandon Stark",
        rating: 5,
        comment: "Completely shifted how I write functions. Less complexity, better readability. Absolutely worth the read.",
        createdAt: "2026-05-28T16:40:00Z"
      }
    ]
  },
  {
    id: "prod_15",
    name: "JavaScript: The Modern Guide",
    description: "Master advanced JavaScript concepts: closures, event loop, asynchronous code, prototype chains, ES modules, and Node.js backend execution patterns.",
    price: 49.50,
    category: "Books",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.7,
    stock: 25,
    featured: false,
    reviews: [
      {
        id: "rev_15_1",
        userName: "Liam Garcia",
        rating: 5,
        comment: "The explanation of promises and async/await is the clearest I have ever seen. Outstanding reference material.",
        createdAt: "2026-05-29T13:10:00Z"
      }
    ]
  }
];

const mockTestimonials = [
  {
    id: "wrev_1",
    userName: "Marcus K.",
    rating: 5,
    comment: "Veloce has the fastest delivery and the cleanest aesthetic. Buying from here is a breeze!",
    createdAt: "2026-05-29T14:30:00Z"
  },
  {
    id: "wrev_2",
    userName: "Sarah Jenkins",
    rating: 5,
    comment: "Love the glassmorphic dark design. Navigating the products feels incredibly premium and interactive.",
    createdAt: "2026-05-30T09:15:00Z"
  }
];

async function seed() {
  console.log('Seeding products, users, reviews, and testimonials to Supabase...');
  try {
    // 1. Clear existing records in dependency order
    console.log('Clearing existing records in dependency order...');
    
    // Clear dependent tables first
    const clearCart = await supabase.from('cart').delete().neq('user_id', NIL_UUID);
    if (clearCart.error) {
      console.warn('Info: cart table deletion failed:', clearCart.error.message);
    }
    
    const clearOrderItems = await supabase.from('order_items').delete().neq('product_id', NIL_UUID);
    if (clearOrderItems.error) {
      console.warn('Info: order_items table deletion failed:', clearOrderItems.error.message);
    }

    const clearOrders = await supabase.from('orders').delete().neq('id', NIL_UUID);
    if (clearOrders.error) {
      console.warn('Info: orders table deletion failed:', clearOrders.error.message);
    }

    const clearReviews = await supabase.from('reviews').delete().neq('id', NIL_UUID);
    if (clearReviews.error) {
      console.warn('Info: reviews table deletion failed:', clearReviews.error.message);
    }

    const clearTestimonials = await supabase.from('testimonials').delete().neq('id', NIL_UUID);
    if (clearTestimonials.error) {
      console.warn('Info: testimonials table deletion failed:', clearTestimonials.error.message);
    }

    const clearUsers = await supabase.from('users').delete().neq('id', NIL_UUID);
    if (clearUsers.error) {
      console.warn('Info: users table deletion failed:', clearUsers.error.message);
    }

    const clearProducts = await supabase.from('products').delete().neq('id', NIL_UUID);
    if (clearProducts.error) {
      console.error('CRITICAL ERROR: products table deletion failed:', clearProducts.error.message);
      throw clearProducts.error;
    }
    
    // 2. Insert mock users
    const mockUsers = [
      { id: getUuid('user_sophia'), name: "Sophia Vance", email: "sophia@example.com", password: "password123" },
      { id: getUuid('user_david'), name: "David Miller", email: "david@example.com", password: "password123" },
      { id: getUuid('user_elena'), name: "Elena Rostova", email: "elena@example.com", password: "password123" },
      { id: getUuid('user_liam'), name: "Liam O'Connor", email: "liam@example.com", password: "password123" },
      { id: getUuid('user_grace'), name: "Grace Miller", email: "grace@example.com", password: "password123" },
      { id: getUuid('user_clara'), name: "Clara Adams", email: "clara@example.com", password: "password123" },
      { id: getUuid('user_nate'), name: "Nate Rogers", email: "nate@example.com", password: "password123" },
      { id: getUuid('user_brandon'), name: "Brandon Stark", email: "brandon@example.com", password: "password123" },
      { id: getUuid('user_liamg'), name: "Liam Garcia", email: "liamg@example.com", password: "password123" }
    ];

    console.log(`Inserting ${mockUsers.length} users...`);
    const { error: userError } = await supabase.from('users').insert(mockUsers);
    if (userError) throw userError;

    // 3. Insert products
    const productsToInsert = mockProducts.map(p => ({
      id: getUuid(p.id),
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock
    }));
    
    console.log(`Inserting ${productsToInsert.length} products...`);
    const { error: prodError } = await supabase.from('products').insert(productsToInsert);
    if (prodError) throw prodError;
    
    // 4. Extract and format reviews
    const nameToUserUuid = {
      "Sophia Vance": getUuid('user_sophia'),
      "David Miller": getUuid('user_david'),
      "Elena Rostova": getUuid('user_elena'),
      "Liam O'Connor": getUuid('user_liam'),
      "Grace Miller": getUuid('user_grace'),
      "Clara Adams": getUuid('user_clara'),
      "Nate Rogers": getUuid('user_nate'),
      "Brandon Stark": getUuid('user_brandon'),
      "Liam Garcia": getUuid('user_liamg')
    };

    const reviewsToInsert = [];
    mockProducts.forEach(product => {
      if (Array.isArray(product.reviews)) {
        product.reviews.forEach(review => {
          reviewsToInsert.push({
            id: getUuid(review.id),
            product_id: getUuid(product.id),
            user_id: nameToUserUuid[review.userName] || getUuid(review.userName),
            rating: review.rating,
            comment: review.comment,
            created_at: review.createdAt
          });
        });
      }
    });
    
    if (reviewsToInsert.length > 0) {
      console.log(`Inserting ${reviewsToInsert.length} product reviews...`);
      const { error: revError } = await supabase.from('reviews').insert(reviewsToInsert);
      if (revError) throw revError;
    }
    
    // 5. Insert testimonials
    const testimonialsToInsert = mockTestimonials.map(t => ({
      id: getUuid(t.id),
      user_name: t.userName,
      message: t.comment,
      rating: t.rating,
      created_at: t.createdAt
    }));

    console.log(`Inserting ${testimonialsToInsert.length} testimonials...`);
    const { error: testError } = await supabase.from('testimonials').insert(testimonialsToInsert);
    if (testError) throw testError;
    
    console.log('Seeding relational database completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding relational database crashed:', err.message);
    process.exit(1);
  }
}

seed();
