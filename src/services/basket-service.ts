import { db } from '@/lib/firebase';
import { CartItem, FirestoreCartItem, SelectedConfiguration } from '@/types';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';

const getBasketCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'basket');
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
     * Adds a new item to the user's basket.
     * Checks for an existing item with the same product ID and configuration.
     */
    async addToBasket(userId: string, item: Omit<CartItem, 'cartItemId'>): Promise<string> {
        const basketColRef = getBasketCollectionRef(userId);

        // Create a comparable string for the configuration
        const configString = JSON.stringify(item.configuration.map(c => ({ optionId: c.optionId, value: c.value })).sort((a, b) => a.optionId.localeCompare(b.optionId)));

        // Query for an existing item
        const q = query(
            basketColRef,
            where('productId', '==', item.product.id),
            where('configString', '==', configString) // We'll need to add this field
        );
        
        const existingItemsSnapshot = await getDocs(q);

        if (!existingItemsSnapshot.empty) {
            // Item exists, update quantity
            const existingDoc = existingItemsSnapshot.docs[0];
            const newQuantity = existingDoc.data().quantity + item.quantity;
            await updateDoc(existingDoc.ref, { quantity: newQuantity });
            return existingDoc.id;
        } else {
            // Item doesn't exist, add new document
            const firestoreItem = toFirestoreCartItem(item);
            const docRef = await addDoc(basketColRef, {
                ...firestoreItem,
                configString // Store for querying
            });
            return docRef.id;
        }
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
        // This is a simplified merge. A more robust implementation would handle
        // conflicts (e.g., same item in local and remote cart) by summing quantities.
        const batch = writeBatch(db);
        const basketColRef = getBasketCollectionRef(userId);

        for (const item of localCartItems) {
            const firestoreItem = toFirestoreCartItem(item);
            const configString = JSON.stringify(item.configuration.map(c => ({ optionId: c.optionId, value: c.value })).sort((a, b) => a.optionId.localeCompare(b.optionId)));
            
            // In a real scenario, you'd query for existing items here to merge quantities.
            // For this implementation, we'll just add them.
            const newDocRef = doc(basketColRef); // Create a new doc ref
            batch.set(newDocRef, { ...firestoreItem, configString });
        }

        await batch.commit();
    }
};
