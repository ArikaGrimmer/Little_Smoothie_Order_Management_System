// Script to fix operator role for existing users
// Run with: node fix-operator-role.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const operatorEmails = (process.env.OPERATOR_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

if (operatorEmails.length === 0) {
  console.error('❌ ERROR: OPERATOR_EMAILS not configured in .env file');
  console.log('\nPlease add to your .env file:');
  console.log('OPERATOR_EMAILS=your-email@example.com');
  process.exit(1);
}

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('❌ ERROR: MONGO_URL not found in .env file');
  process.exit(1);
}

async function fixOperatorRoles() {
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    const db = client.db();
    const users = db.collection('users');
    
    console.log(`\n📋 Looking for operator emails: ${operatorEmails.join(', ')}`);
    
    // Find all users with operator emails
    const operatorUsers = await users.find({
      email: { $in: operatorEmails }
    }).toArray();
    
    if (operatorUsers.length === 0) {
      console.log('\n⚠️  No users found with operator emails.');
      console.log('   Make sure you have logged in with one of these emails:');
      operatorEmails.forEach(email => console.log(`   - ${email}`));
      return;
    }
    
    console.log(`\n👥 Found ${operatorUsers.length} user(s) to update:`);
    operatorUsers.forEach(user => {
      console.log(`   - ${user.email} (current roles: ${user.roles.join(', ')})`);
    });
    
    // Update each user to have operator role
    let updated = 0;
    for (const user of operatorUsers) {
      const newRoles = user.roles.includes('operator') 
        ? user.roles 
        : [...user.roles, 'operator'];
      
      if (!user.roles.includes('operator')) {
        await users.updateOne(
          { _id: user._id },
          {
            $set: {
              roles: newRoles,
              updatedAt: Date.now()
            }
          }
        );
        updated++;
        console.log(`\n✅ Updated ${user.email}:`);
        console.log(`   Old roles: ${user.roles.join(', ')}`);
        console.log(`   New roles: ${newRoles.join(', ')}`);
      } else {
        console.log(`\n✓ ${user.email} already has operator role`);
      }
    }
    
    if (updated > 0) {
      console.log(`\n✨ Successfully updated ${updated} user(s)!`);
      console.log('\n📝 Next steps:');
      console.log('   1. Log out from your account');
      console.log('   2. Log back in');
      console.log('   3. You should now have operator access!');
    } else {
      console.log('\n✨ All users already have operator role!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

fixOperatorRoles();

