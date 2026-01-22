export interface CartItem {
    id: string;
    quantity: number;
}

export function addItem(cart: CartItem[], id: string): CartItem[] {
    const existing = cart.find(item => item.id === id)

    if (existing) {
        return cart.map(item =>
            item.id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
    }
    
    return [...cart, { id, quantity: 1}]
}

export function removeItem(cart: CartItem[], id: string): CartItem[] {
    return cart
    .map(item =>
        item.id === id
        ? { ...item,quantity: item.quantity - 1 }
        : item
    )
    .filter(item => item.quantity > 0);
}



const STORAGE_KEY = "cart";

export function loadCart(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveCart(cart: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}