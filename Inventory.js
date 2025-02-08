export class Inventory {
    constructor() {
        this.items = [];
    }

    add(itemId, quantity) {
        const existingItem = this.items.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: itemId,
                quantity
            });
        }
    }

    remove(itemId, quantity) {
        const existingItem = this.items.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity -= quantity;
            if (existingItem.quantity <= 0) {
                this.items = this.items.filter(item => item.id !== itemId);
            }
        }
    }

    count(itemId) {
        const existingItem = this.items.find(item => item.id === itemId);
        return existingItem ? existingItem.quantity : 0;
    }
}