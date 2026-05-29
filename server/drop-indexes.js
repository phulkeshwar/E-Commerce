import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(uri);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(col => console.log(` - ${col.name}`));

    // Drop username_1 on users
    const usersCol = db.collection('users');
    const indexes = await usersCol.indexes();
    console.log('Current indexes on "users" collection:');
    console.log(indexes);

    const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1');
    if (hasUsernameIndex) {
      console.log('Dropping index: username_1');
      await usersCol.dropIndex('username_1');
      console.log('Index "username_1" successfully dropped!');
    } else {
      console.log('Index "username_1" not found on "users" collection.');
    }

    // Let's also check products indexes or order indexes if they have duplicate warnings
    const productsCol = db.collection('products');
    const prodIndexes = await productsCol.indexes();
    console.log('Current indexes on "products" collection:', prodIndexes.map(idx => idx.name));

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

run();
