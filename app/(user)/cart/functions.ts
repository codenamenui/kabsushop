import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const fetchCartOrders = async () => {
    const supabase = createServerActionClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("cart_orders")
        .select(
            `
        id, 
        user_id,
        quantity,
        variants(id, name, picture_url, original_price, membership_price, merchandises(online_payment, physical_payment, receiving_information), sizes(id, name, original_price, membership_price)), 
        shops!inner(id, acronym, logo_url),
        sizes(id, name, original_price, membership_price)
        `
        )
        .eq("user_id", user.id);

    if (error) {
        console.error(error);
        return;
    }

    console.log(data);
    return data;
};
