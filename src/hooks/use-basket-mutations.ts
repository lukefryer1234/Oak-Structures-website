import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BasketService } from '@/services/basket-service';
import { CartItem } from '@/types';
import { useAuth } from '@/context/auth-context';
import { toast } from './use-toast';

const BASKET_QUERY_KEY = 'basket';

export const useBasket = () => {
    const { user } = useAuth();
    return useQuery<CartItem[], Error>({
        queryKey: [BASKET_QUERY_KEY, user?.uid],
        queryFn: () => {
            if (!user) return Promise.resolve([]);
            return BasketService.getBasket(user.uid);
        },
        enabled: !!user, // Only run the query if the user is logged in
    });
};

export const useAddToBasket = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (item: Omit<CartItem, 'cartItemId'>) => {
            if (!user) throw new Error("User not authenticated");
            return BasketService.addToBasket(user.uid, item);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASKET_QUERY_KEY, user?.uid] });
            toast({ title: "Success", description: "Item added to basket." });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
};

export const useUpdateBasketItem = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ basketItemId, newQuantity }: { basketItemId: string, newQuantity: number }) => {
            if (!user) throw new Error("User not authenticated");
            return BasketService.updateBasketItemQuantity(user.uid, basketItemId, newQuantity);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASKET_QUERY_KEY, user?.uid] });
            toast({ title: "Success", description: "Basket updated." });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
};

export const useRemoveBasketItem = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (basketItemId: string) => {
            if (!user) throw new Error("User not authenticated");
            return BasketService.removeBasketItem(user.uid, basketItemId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASKET_QUERY_KEY, user?.uid] });
            toast({ title: "Success", description: "Item removed from basket." });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
};

export const useClearBasket = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: () => {
            if (!user) throw new Error("User not authenticated");
            return BasketService.clearBasket(user.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASKET_QUERY_KEY, user?.uid] });
            toast({ title: "Success", description: "Basket cleared." });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
};

export const useMergeLocalBasket = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (localCartItems: CartItem[]) => {
            if (!user) throw new Error("User not authenticated");
            return BasketService.mergeLocalBasket(user.uid, localCartItems);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASKET_QUERY_KEY, user?.uid] });
        },
        onError: (error) => {
            toast({ title: "Error", description: `Failed to merge carts: ${error.message}`, variant: "destructive" });
        }
    });
};
