import mongoose from 'mongoose';
import Document from './Models/Documents.js';
import DocumentShare from './Models/DocumentShare.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupOrphanedShares() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all deleted documents
    const deletedDocuments = await Document.find({ isDeleted: true }).select('_id');
    const deletedIds = deletedDocuments.map(doc => doc._id);
    
    console.log(`Found ${deletedIds.length} deleted documents`);
    
    if (deletedIds.length > 0) {
      // Delete all shares for these documents
      const result = await DocumentShare.deleteMany({ documentId: { $in: deletedIds } });
      console.log(`✅ Cleaned up ${result.deletedCount} orphaned shares`);
    } else {
      console.log('No deleted documents found, no cleanup needed');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupOrphanedShares();
