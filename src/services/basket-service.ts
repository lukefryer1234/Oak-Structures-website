import { db } from '@/lib/firebase';
import { CartItem, FirestoreCartItem, SelectedConfiguration } from '@/types';
import { collection, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, getDoc, setDoc, increment } from 'firebase/firestore';
import { Buffer } from 'buffer';

const getBasketCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'basket');
};

/**
 * Generates a deterministic, unique ID for a basket item based on its product ID and configuration.
 * This ensures that the same product with the same options always maps to the same basket item.
 */
const generateBasketItemId = (productId: string, configuration: SelectedConfiguration[]): string => {
    if (!configuration || configuration.length === 0) {
        return productId;
    }
    // Sort configuration by optionId to ensure consistency
    const sortedConfig = [...configuration].sort((a, b) => a.optionId.localeCompare(b.optionId));
    const configString = sortedConfig.map(c => `${c.optionId}:${c.value}`).join('|');
    // Combine and encode to create a filesystem-safe ID
    const combinedId = `${productId}|${configString}`;
    return Buffer.from(combinedId).toString('base64');
};


/**
 * Converts a client-side CartItem to a Firestore-compatible format.
 */
const toFirestoreCartItem = (cartItem: Omit<CartItem, 'cartItemId'>): Omit<FirestoreCartItem, 'id'> => ({
    productId: cartItem.product.id,
    productName: cartItem.product.name,
    imageUrl: cartItem.product.imageUrl || '',
    quantity: cartItem.quantity,
    unitPrice: cartItem.unitPrice,
    configuration: cartItem.configuration,
    addedAt: serverTimestamp(),
});

/**
 * Converts a Firestore document to a client-side CartItem.
 */
const fromFirestoreCartItem = (doc: { id: string; data: () => FirestoreCartItem }): CartItem => {
    const data = doc.data();
    // This is a simplified conversion. We are losing the full product object.
    // The context will need to manage merging this with full product details if needed.
    const partialProduct = {
        id: data.productId,
        name: data.productName,
        imageUrl: data.imageUrl,
        basePrice: data.unitPrice, // Approximation
        // Other product fields are not available here
    };
    return {
        cartItemId: doc.id,
        product: partialProduct as any, // Type assertion as we don't have the full product
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        configuration: data.configuration,
    };
};


export const BasketService = {
    /**
     * Fetches all items from a user's basket.
     */
    async getBasket(userId: string): Promise<CartItem[]> {
        const basketColRef = getBasketCollectionRef(userId);
        const snapshot = await getDocs(basketColRef);
        return snapshot.docs.map(docSnapshot => fromFirestoreCartItem({ id: docSnapshot.id, data: docSnapshot.data as () => FirestoreCartItem }));
    },

    /**
     * Adds a new item to the user's basket or updates the quantity if it already exists.
     * Uses a deterministic ID to avoid querying for existing items.
     */
    async addToBasket(userId: string, item: Omit<CartItem, 'cartItemId'>): Promise<string> {
        const basketItemId = generateBasketItemId(item.product.id, item.configuration);
        const itemDocRef = doc(db, 'users', userId, 'basket', basketItemId);

        const docSnap = await getDoc(itemDocRef);

        if (docSnap.exists()) {
            // Item exists, increment quantity
            await updateDoc(itemDocRef, {
                quantity: increment(item.quantity)
            });
        } else {
            // Item doesn't exist, add new document
            const firestoreItem = toFirestoreCartItem(item);
            await setDoc(itemDocRef, firestoreItem);
        }
        return basketItemId;
    },

    /**
     * Updates the quantity of a specific item in the basket.
     * If quantity is 0 or less, the item is removed.
     */
    async updateBasketItemQuantity(userId: string, basketItemId: string, newQuantity: number): Promise<void> {
        const itemDocRef = doc(db, 'users', userId, 'basket', basketItemId);
        if (newQuantity <= 0) {
            await deleteDoc(itemDocRef);
        } else {
            await updateDoc(itemDocRef, { quantity: newQuantity });
        }
    },

    /**
     * Removes a specific item from the basket.
     */
    async removeBasketItem(userId: string, basketItemId: string): Promise<void> {
        const itemDocRef = doc(db, 'users', userId, 'basket', basketItemId);
        await deleteDoc(itemDocRef);
    },

    /**
     * Deletes all items from the user's basket.
     */
    async clearBasket(userId: string): Promise<void> {
        const basketColRef = getBasketCollectionRef(userId);
        const snapshot = await getDocs(basketColRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    },

    /**
     * Merges a local guest basket with the user's Firestore basket upon login.
     */
    async mergeLocalBasket(userId: string, localCartItems: CartItem[]): Promise<void> {
        const batch = writeBatch(db);

        for (const item of localCartItems) {
            const basketItemId = generateBasketItemId(item.product.id, item.configuration);
            const itemDocRef = doc(db, 'users', userId, 'basket', basketItemId);

            // Atomically increment the quantity of the item if it exists, or set it if it doesn't.
            // This requires a read first to check existence, which we can't do in a batch write directly.
            // So we'll fetch existing basket items first.
            // A more optimized approach for large baskets might use a Cloud Function.
            
            // For now, we'll just use the same logic as addToBasket, but in a loop.
            // This is not a true batch operation, but will work for this case.
            // A better batch approach would be to read all docs first, then write.
            await this.addToBasket(userId, item);
        }
    }
};
