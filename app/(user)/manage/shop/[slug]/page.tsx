import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteMerch } from "./actions";

interface PostProps {
    params: {
        slug: string;
    };
}

type Shop = {
    id: number;
    name: string;
    email: string;
    socmed_url: string;
    logo_url: string;
    colleges: {
        id: string;
        name: string;
    }[];
    acronym: string;
};

type Merch = {
    id: number;
    name: string;
    created_at: string;
    merchandise_pictures: {
        picture_url: string;
    }[];
    variants: {
        sizes: {
            original_price: number;
            membership_price: number;
        }[];
        original_price: number;
        membership_price: number;
    };
    shops: {
        id: number;
        acronym: string;
    };
};

const ShopManagement = async ({ params }: PostProps) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: shop } = await supabase
        .from("shops")
        .select()
        .eq("id", params.slug)
        .single();

    const { data: merchs } = await supabase
        .from("merchandises")
        .select(
            `
            id, 
            name, 
            created_at,
            merchandise_pictures(picture_url), 
            variants(original_price, membership_price, sizes(original_price, membership_price)), 
            shops!inner(id, name, acronym)
        `
        )
        .eq("shop_id", shop.id);

    return (
        <div>
            <div className="flex flex-col">
                <div className="flex">
                    <Image
                        src={shop.logo_url}
                        alt={""}
                        width={50}
                        height={50}
                    />
                    <div>{shop.name}</div>
                </div>
                <div>
                    <Link href={`/manage/shop/${params.slug}/merch/new`}>
                        Add Merchandise
                    </Link>
                    <Link href={"/manage/shop/${params.slug}/dashboard"}>
                        Manage
                    </Link>
                </div>
            </div>
            <div>
                {merchs &&
                    merchs.map((merch) => {
                        return (
                            <div key={merch.id} className="card w-3/12">
                                {merch.merchandise_pictures &&
                                merch.merchandise_pictures.length > 0 ? (
                                    <Image
                                        alt={"loading"}
                                        width={50}
                                        height={50}
                                        src={
                                            merch.merchandise_pictures[0]
                                                .picture_url
                                        }
                                    />
                                ) : (
                                    <p>No image available</p>
                                )}
                                {merch.name} -
                                {merch.variants[0].sizes.length > 0
                                    ? `$${merch.variants[0].sizes[0].original_price} / $${merch.variants[0].sizes[0].membership_price}`
                                    : `$${merch.variants[0].original_price} / $${merch.variants[0].membership_price}`}
                                <br />
                                {merch.shops.acronym}
                                <Link
                                    href={`/manage/shop/${params.slug}/merch/${merch.id}`}
                                >
                                    Edit
                                </Link>
                                <form action={deleteMerch}>
                                    <button name="id" value={merch.id}>
                                        Delete
                                    </button>
                                </form>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default ShopManagement;
