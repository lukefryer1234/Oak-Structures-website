// src/lib/api/basket-api.ts
export interface BasketItem {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  customOptions?: any;
}

export const basketApi = {
  addToBasket: async (item: any) => {
    console.log("Adding to basket:", item);
    return { success: true, name: item.name, description: item.description };
  },
  addMultipleToBasket: async (items: any[]) => {
    console.log("Adding multiple to basket:", items);
    return { success: true, items: items.map(item => ({ id: item.productId })) };
  }
};
