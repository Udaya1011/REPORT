import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // The collection name is usually the plural of the model name in lowercase, or as defined
    // In server.js: const Report = mongoose.model('Report', reportSchema);
    // So collection is 'reports'
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      if (collection.collectionName === 'reports') {
        await collection.deleteMany({});
        console.log('Cleared "reports" collection');
      }
    }
    
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearData();
