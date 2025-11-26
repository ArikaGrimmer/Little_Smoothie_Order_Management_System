/**
 * Database Seeding Script
 * 
 * This script populates the MongoDB database with initial menu data.
 * Run with: node scripts/seed-database.js
 */

import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/smoothie_orders';

const smoothieBases = [
  { id: 'yogurt', name: 'Greek Yogurt Base', price: 4.50 },
  { id: 'milk', name: 'Almond Milk Base', price: 4.00 },
  { id: 'juice', name: 'Orange Juice Base', price: 4.25 },
  { id: 'coconut', name: 'Coconut Water Base', price: 4.75 }
];

const smoothieFruits = [
  { id: 'strawberry', name: 'Strawberry', extraPrice: 0.50 },
  { id: 'banana', name: 'Banana', extraPrice: 0.30 },
  { id: 'blueberry', name: 'Blueberry', extraPrice: 0.75 },
  { id: 'mango', name: 'Mango', extraPrice: 0.60 },
  { id: 'pineapple', name: 'Pineapple', extraPrice: 0.55 },
  { id: 'raspberry', name: 'Raspberry', extraPrice: 0.65 },
  { id: 'peach', name: 'Peach', extraPrice: 0.50 },
  { id: 'kiwi', name: 'Kiwi', extraPrice: 0.70 }
];

const smoothieSizes = [
  { id: 'small', name: 'Small (12oz)', multiplier: 1.0 },
  { id: 'medium', name: 'Medium (16oz)', multiplier: 1.3 },
  { id: 'large', name: 'Large (20oz)', multiplier: 1.6 },
  { id: 'xlarge', name: 'X-Large (24oz)', multiplier: 2.0 }
];

async function seedDatabase() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing menu data...');
    await db.collection('smoothie_bases').deleteMany({});
    await db.collection('smoothie_fruits').deleteMany({});
    await db.collection('smoothie_sizes').deleteMany({});
    
    // Insert smoothie bases
    console.log('\nInserting smoothie bases...');
    const basesResult = await db.collection('smoothie_bases').insertMany(smoothieBases);
    console.log(`✓ Inserted ${basesResult.insertedCount} smoothie bases`);
    
    // Insert fruits
    console.log('\nInserting fruits...');
    const fruitsResult = await db.collection('smoothie_fruits').insertMany(smoothieFruits);
    console.log(`✓ Inserted ${fruitsResult.insertedCount} fruits`);
    
    // Insert sizes
    console.log('\nInserting sizes...');
    const sizesResult = await db.collection('smoothie_sizes').insertMany(smoothieSizes);
    console.log(`✓ Inserted ${sizesResult.insertedCount} sizes`);
    
    // Create indexes for better performance
    console.log('\nCreating indexes...');
    await db.collection('orders').createIndex({ customerId: 1, status: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('smoothie_bases').createIndex({ id: 1 }, { unique: true });
    await db.collection('smoothie_fruits').createIndex({ id: 1 }, { unique: true });
    await db.collection('smoothie_sizes').createIndex({ id: 1 }, { unique: true });
    console.log('✓ Indexes created');
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${smoothieBases.length} smoothie bases`);
    console.log(`- ${smoothieFruits.length} fruits`);
    console.log(`- ${smoothieSizes.length} sizes`);
    console.log('\nYou can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seeding
seedDatabase();

