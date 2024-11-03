"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Category = {
    id: number;
    name: string;
    picture_url: string;
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const router = useRouter();

    useEffect(() => {
        const getCategories = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase.from("categories").select();
            setCategories(data);
        };
        getCategories();
    }, []);

    const redirectCategory = (category: Category) => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("category", category.name);
        router.push(`/search?${queryParams.toString()}`);
    };

    return (
        <div>
            <h1>Categories</h1>
            <div>
                {categories.map((category) => {
                    return (
                        <button
                            key={category.id}
                            onClick={() => {
                                redirectCategory(category);
                            }}
                        >
                            <h2>{category.name}</h2>
                            <div>
                                <Image
                                    src={category.picture_url}
                                    alt={category.name}
                                    width={50}
                                    height={50}
                                    priority
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoriesPage;
