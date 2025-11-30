// Comprehensive database seeding script
// Run with: npm run seed
// This will seed all collections needed for the application

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Menu Items
const smoothieItems = [
  {
    id: "smoothie-1",
    name: "Tropical Paradise",
    description: "A refreshing blend of pineapple, mango, banana, and coconut water. Perfect for a sunny day!",
    basePrice: 8.99,
    category: "fruit",
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
    ingredients: ["Pineapple", "Mango", "Banana", "Coconut Water", "Ice"],
    healthBenefits: ["Vitamin C", "Immune Support", "Hydrating"],
    isAvailable: true,
    isFeatured: true,
    allergens: [],
    nutritionInfo: {
      calories: 180,
      protein: 2,
      carbs: 45,
      fat: 0.5
    }
  },
  {
    id: "smoothie-2",
    name: "Berry Blast",
    description: "Antioxidant-rich blend of strawberries, blueberries, raspberries, and açai with almond milk.",
    basePrice: 9.49,
    category: "berry",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop",
    ingredients: ["Strawberries", "Blueberries", "Raspberries", "Açai", "Almond Milk"],
    healthBenefits: ["Antioxidants", "Heart Health", "Anti-Inflammatory"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["tree nuts"],
    nutritionInfo: {
      calories: 210,
      protein: 4,
      carbs: 38,
      fat: 5
    }
  },
  {
    id: "smoothie-3",
    name: "Green Power",
    description: "Nutrient-packed with spinach, kale, green apple, cucumber, and ginger. Energy in a glass!",
    basePrice: 9.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop",
    ingredients: ["Spinach", "Kale", "Green Apple", "Cucumber", "Ginger", "Lemon"],
    healthBenefits: ["Detoxifying", "Energy Boost", "Alkalizing"],
    isAvailable: true,
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 145,
      protein: 3,
      carbs: 32,
      fat: 1
    }
  },
  {
    id: "smoothie-4",
    name: "Chocolate Peanut Butter",
    description: "Indulgent yet healthy! Cacao, peanut butter, banana, and oat milk create a creamy delight.",
    basePrice: 10.49,
    category: "protein",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop",
    ingredients: ["Cacao", "Peanut Butter", "Banana", "Oat Milk", "Honey", "Vanilla"],
    healthBenefits: ["Protein Rich", "Energy", "Muscle Recovery"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["peanuts"],
    nutritionInfo: {
      calories: 320,
      protein: 12,
      carbs: 42,
      fat: 14
    }
  },
  {
    id: "smoothie-5",
    name: "Mango Lassi",
    description: "Traditional Indian-inspired smoothie with mango, yogurt, cardamom, and a hint of rose water.",
    basePrice: 8.49,
    category: "fruit",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
    ingredients: ["Mango", "Greek Yogurt", "Cardamom", "Rose Water", "Honey"],
    healthBenefits: ["Probiotics", "Digestive Health", "Vitamin A"],
    isAvailable: true,
    isFeatured: false,
    allergens: ["dairy"],
    nutritionInfo: {
      calories: 195,
      protein: 8,
      carbs: 35,
      fat: 3
    }
  },
  {
    id: "smoothie-6",
    name: "Matcha Energizer",
    description: "Green tea matcha powder with banana, spinach, and coconut milk for sustained energy.",
    basePrice: 9.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop",
    ingredients: ["Matcha Powder", "Banana", "Spinach", "Coconut Milk", "Honey"],
    healthBenefits: ["Sustained Energy", "Focus", "Antioxidants"],
    isAvailable: true,
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 220,
      protein: 5,
      carbs: 36,
      fat: 7
    }
  },
  {
    id: "smoothie-7",
    name: "Strawberry Banana Classic",
    description: "The timeless favorite! Fresh strawberries and ripe banana blended with vanilla yogurt.",
    basePrice: 7.99,
    category: "berry",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop",
    ingredients: ["Strawberries", "Banana", "Vanilla Yogurt", "Honey"],
    healthBenefits: ["Vitamin C", "Potassium", "Probiotics"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["dairy"],
    nutritionInfo: {
      calories: 185,
      protein: 6,
      carbs: 38,
      fat: 2
    }
  },
  {
    id: "smoothie-8",
    name: "Avocado Dream",
    description: "Creamy avocado with spinach, lime, pineapple, and coconut water. Silky smooth perfection!",
    basePrice: 10.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&h=400&fit=crop",
    ingredients: ["Avocado", "Spinach", "Lime", "Pineapple", "Coconut Water"],
    healthBenefits: ["Healthy Fats", "Heart Health", "Vitamin K"],
    isAvailable: false,
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 280,
      protein: 4,
      carbs: 32,
      fat: 18
    }
  }
];

// Smoothie Bases (for custom smoothie builder)
const smoothieBases = [
  { id: "base-1", name: "Almond Milk", price: 5.99 },
  { id: "base-2", name: "Coconut Water", price: 4.99 },
  { id: "base-3", name: "Oat Milk", price: 5.49 },
  { id: "base-4", name: "Greek Yogurt", price: 6.49 },
  { id: "base-5", name: "Vanilla Yogurt", price: 5.99 }
];

// Smoothie Fruits (add-ons)
const smoothieFruits = [
  { id: "fruit-1", name: "Strawberry", extraPrice: 1.50 },
  { id: "fruit-2", name: "Blueberry", extraPrice: 1.75 },
  { id: "fruit-3", name: "Banana", extraPrice: 1.00 },
  { id: "fruit-4", name: "Mango", extraPrice: 1.50 },
  { id: "fruit-5", name: "Pineapple", extraPrice: 1.25 },
  { id: "fruit-6", name: "Raspberry", extraPrice: 1.75 },
  { id: "fruit-7", name: "Peach", extraPrice: 1.50 },
  { id: "fruit-8", name: "Kiwi", extraPrice: 1.75 }
];

// Smoothie Sizes
const smoothieSizes = [
  { id: "size-1", name: "Small (12oz)", multiplier: 1.0 },
  { id: "size-2", name: "Medium (16oz)", multiplier: 1.25 },
  { id: "size-3", name: "Large (20oz)", multiplier: 1.5 },
  { id: "size-4", name: "X-Large (24oz)", multiplier: 1.75 }
];

async function seedDatabase() {
  const mongoUrl = process.env.MONGO_URL;
  
  if (!mongoUrl) {
    console.error('❌ ERROR: MONGO_URL not found in .env file');
    console.log('Please add your MongoDB connection string to .env:');
    console.log('MONGO_URL=mongodb://localhost:27017/smoothie_db');
    console.log('or for Atlas:');
    console.log('MONGO_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/smoothie_db');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  console.log(`Connection: ${mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    const db = client.db();
    
    // Seed Menu Items
    console.log('\n📋 Seeding menu_items collection...');
    const menuItemsCol = db.collection('menu_items');
    await menuItemsCol.deleteMany({});
    await menuItemsCol.insertMany(smoothieItems);
    console.log(`✅ Inserted ${smoothieItems.length} menu items`);
    
    // Seed Bases
    console.log('\n🥛 Seeding smoothie_bases collection...');
    const basesCol = db.collection('smoothie_bases');
    await basesCol.deleteMany({});
    await basesCol.insertMany(smoothieBases);
    console.log(`✅ Inserted ${smoothieBases.length} bases`);
    
    // Seed Fruits
    console.log('\n🍓 Seeding smoothie_fruits collection...');
    const fruitsCol = db.collection('smoothie_fruits');
    await fruitsCol.deleteMany({});
    await fruitsCol.insertMany(smoothieFruits);
    console.log(`✅ Inserted ${smoothieFruits.length} fruits`);
    
    // Seed Sizes
    console.log('\n📏 Seeding smoothie_sizes collection...');
    const sizesCol = db.collection('smoothie_sizes');
    await sizesCol.deleteMany({});
    await sizesCol.insertMany(smoothieSizes);
    console.log(`✅ Inserted ${smoothieSizes.length} sizes`);
    
    // Summary
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - menu_items: ${await menuItemsCol.countDocuments()} items`);
    console.log(`   - smoothie_bases: ${await basesCol.countDocuments()} bases`);
    console.log(`   - smoothie_fruits: ${await fruitsCol.countDocuments()} fruits`);
    console.log(`   - smoothie_sizes: ${await sizesCol.countDocuments()} sizes`);
    console.log(`\n💡 Your partner can now run: npm run seed`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

// Run the seeding
seedDatabase();

