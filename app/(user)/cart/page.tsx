import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchCartOrders } from "./functions";

type CartOrder = {
    id: any;
    user_id: any;
    quantity: any;
    variants: {
        id: any;
        name: any;
        picture_url: any;
        original_price: any;
        membership_price: any;
        merchandises: {
            online_payment: any;
            physical_payment: any;
            receiving_information: any;
        }[];
        sizes: {
            id: number;
            name: string;
            original_price: number;
            membership_price: number;
        }[];
    }[];
    shops: {
        id: number;
        acronym: string;
        logo_url: string;
    }[];
    sizes: {
        id: number;
        name: string;
        original_price: number;
        membership_price: number;
    }[];
};

type CartSelection = {
    cart: CartOrder;
    selected: boolean;
};

const Cart = () => {
    const cartOrders = fetchCartOrders();

    return <div>Cart</div>;
};

export default Cart;
