export type CartItem = {
    id: string;
    quantity: number;
};

export function addToCart(cart: CartItem[], id: string): CartItem[] {
    const existing = cart.find((item) => item.id === id);

    if (existing) {
        return cart.map((item) =>
        item.id == id ? { ... item, quantity: item.quantity + 1 }  : item
     );
    }

    return [...cart, { id, quantity: 1}];
}

export function removeFromCart(cart: CartItem[], id: string): CartItem[] {
return cart.filter((item) => item.id !== id);
}

export function increaseQuantity(cart: CartItem[], id: string): CartItem[] {
    return cart.map((item) => 
    item.id == id ? { ...item, quantity: item.quantity + 1 } : item
 );
}

export function decreaseQuantity(cart: CartItem[], id:string): CartItem[] {
    return cart
    .map((item) =>
    item.id === id ? { ...item, quantity: item.quantity - 1 } : item 
 )
 .filter((item) => item.quantity > 0);
}

export function clearCart(): CartItem[] {
    return [];
}


