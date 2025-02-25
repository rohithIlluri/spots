import { collection, addDoc, getDocs, getDoc, doc, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Base64 encode images instead of using Firebase Storage
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Create a new spot
export async function createSpot(spotData, imageFile) {
  try {
    console.log('Saving spot to database...');
    
    let imageUrl = '';
    
    if (imageFile) {
      // Base64 encode the image
      imageUrl = await getBase64(imageFile);
    }
    
    const user = auth.currentUser;
    
    const newSpot = {
      id: uuidv4(),
      userId: user ? user.uid : 'anonymous',
      userName: user ? user.displayName || user.email : 'Anonymous User',
      location: spotData.location,
      content: {
        description: spotData.description,
        media: imageUrl ? [imageUrl] : []
      },
      metadata: {
        category: spotData.category,
        createdAt: new Date().toISOString(),
        tags: spotData.tags || []
      },
      interactions: {
        visitors: [],
        comments: []
      }
    };
    
    const docRef = await addDoc(collection(db, 'spots'), newSpot);
    console.log('Spot created with ID:', docRef.id);
    
    return { id: docRef.id, ...newSpot };
  } catch (error) {
    console.error('Error creating spot:', error);
    throw error;
  }
}

// Get all spots
export async function getAllSpots() {
  try {
    const spotsSnapshot = await getDocs(collection(db, 'spots'));
    return spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all spots:', error);
    throw error;
  }
}

// Get spots by category
export async function getSpotsByCategory(category) {
  try {
    const spotsRef = collection(db, 'spots');
    const q = query(spotsRef, where("metadata.category", "==", category));
    const spotsSnapshot = await getDocs(q);
    return spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting spots for category ${category}:`, error);
    throw error;
  }
}

// Get a spot by ID
export async function getSpotById(spotId) {
  try {
    const spotDoc = await getDoc(doc(db, 'spots', spotId));
    if (!spotDoc.exists()) {
      throw new Error(`Spot with ID ${spotId} not found`);
    }
    return {
      id: spotDoc.id,
      ...spotDoc.data()
    };
  } catch (error) {
    console.error(`Error getting spot with ID ${spotId}:`, error);
    throw error;
  }
}

// Get a featured spot
export async function getFeaturedSpot() {
  try {
    const spotsSnapshot = await getDocs(collection(db, 'spots'));
    const spots = spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return spots.length > 0 ? spots[0] : null;
  } catch (error) {
    console.error('Error getting featured spot:', error);
    throw error;
  }
}

// Record a visit to a spot
export async function visitSpot(spotId, userId) {
  try {
    const spotRef = doc(db, 'spots', spotId);
    await updateDoc(spotRef, {
      "interactions.visitors": arrayUnion(userId)
    });
    return true;
  } catch (error) {
    console.error(`Error recording visit to spot ${spotId}:`, error);
    throw error;
  }
}

// Add a comment to a spot
export async function addComment(spotId, comment) {
  try {
    const spotRef = doc(db, 'spots', spotId);
    await updateDoc(spotRef, {
      "interactions.comments": arrayUnion({
        id: uuidv4(),
        userId: comment.userId,
        userName: comment.userName,
        text: comment.text,
        timestamp: new Date().toISOString()
      })
    });
    return true;
  } catch (error) {
    console.error(`Error adding comment to spot ${spotId}:`, error);
    throw error;
  }
}