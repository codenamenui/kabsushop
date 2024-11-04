"use client";

import React, { useEffect, useState } from "react";
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";

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

type Category = {
    id: number;
    name: string;
};

type Merch = {
    id: number;
    name: string;
    created_at: string;
    merchandise_pictures: {
        picture_url: string;
    }[];
    variants: {
        original_price: number;
        membership_price: number;
    }[];
    shops: {
        id: number;
        acronym: string;
    };
    merchandise_categories: {
        id: number;
        cat_id: number;
    }[];
};

const SearchPage = () => {
    const supabase = createClientComponentClient();
    const searchParams = useSearchParams();
    const query = searchParams.get("query");
    const categoryParam = searchParams.get("category");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedShops, setSelectedShops] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [results, setResults] = useState<Merch[]>([]);
    const router = useRouter(); // Initialize useRouter
    const [sort, setSort] = useState("date");
    const path = usePathname();
    const params = useParams();
    const shopId = params.slug;
    const [shop, setShop] = useState<Shop>(null);

    // Fetch categories
    useEffect(() => {
        const getCategories = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase
                .from("categories")
                .select("id, name");
            setCategories(data);
        };
        getCategories();

        const getShop = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase
                .from("shops")
                .select(
                    "id, name, email, socmed_url, logo_url, colleges(id, name), acronym"
                )
                .eq("id", shopId)
                .single();
            if (error) {
                console.error(error);
                return;
            }
            setShop(data);
        };
        getShop();
    }, []);

    // Fetch products matching the query, categories, and shops
    const fetchMerchandises = async (
        query: string | null,
        categories: number[],
        shops: number[]
    ) => {
        let supabaseQuery = supabase.from("merchandises").select(`
            id, 
            name, 
            created_at,
            merchandise_pictures(picture_url), 
            variants(original_price, membership_price), 
            shops!inner(id, name),
            merchandise_categories(id, cat_id)
        `);

        // Apply name search if a query is provided
        if (query) {
            supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
        }

        const { data, error } = await supabaseQuery;
        let filteredResults;
        if (data == null) {
            filteredResults = [];
        } else {
            filteredResults = data;
        }

        if (categories.length > 0) {
            // Filter the data to only include items that have at least one matching category
            filteredResults = data.filter((item) => {
                return item.merchandise_categories?.some((category) =>
                    categories.includes(category.cat_id)
                );
            });
        }

        filteredResults = filteredResults.filter((item) => {
            return shopId == item.shops?.id;
        });

        if (sort === "date") {
            console.log(filteredResults);
            filteredResults.sort((a, b) => {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            });
        } else if (sort === "ascending") {
            filteredResults.sort((a, b) => {
                const priceA = a.variants[0]?.original_price || 0; // Fallback to 0 if no variants
                const priceB = b.variants[0]?.original_price || 0; // Fallback to 0 if no variants
                return priceA - priceB; // Ascending order
            });
        } else if (sort === "descending") {
            filteredResults.sort((a, b) => {
                const priceA = a.variants[0]?.original_price || 0; // Fallback to 0 if no variants
                const priceB = b.variants[0]?.original_price || 0; // Fallback to 0 if no variants
                return priceB - priceA; // Ascending order
            });
        }
        console.log(sort);
        if (error) {
            console.error(error);
        } else {
            setResults(filteredResults || []);
        }
    };

    // Fetch data when query, selectedCategories, or selectedShops change
    useEffect(() => {
        if (categoryParam) {
            const categoryIds = categoryParam.split(",").map(Number);
            setSelectedCategories(categoryIds); // Set selected categories from URL param
        }

        fetchMerchandises(query, selectedCategories, selectedShops);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, categoryParam, sort]); // Listen for changes in query, categoryParam, and shopParam

    // Handle category change
    const handleCategoryChange = (categoryId: number) => {
        const updatedSelected = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(updatedSelected);

        // Update the URL with the new search parameters
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("category", updatedSelected.join(",")); // Set the 'category' param to the selected IDs
        if (path.includes("/shop")) {
            router.push(`/shop/${shopId}?${queryParams.toString()}`);
        } else {
            router.push(`/search?${queryParams.toString()}`);
        }
    };

    // Handle shop change
    const handleShopChange = (shopId: number) => {
        const updatedSelected = selectedShops.includes(shopId)
            ? selectedShops.filter((id) => id !== shopId)
            : [...selectedShops, shopId];

        setSelectedShops(updatedSelected);

        // Update the URL with the new search parameters
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("shop", updatedSelected.join(",")); // Set the 'shop' param to the selected IDs
        router.push(`/search?${queryParams.toString()}`); // Update the URL without reloading
    };

    if (shop == null) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex">
                <div className="flex-col border-r-2 border-gray-400 h-screen p-1">
                    <div>
                        <p>Categories</p>
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    id={`category-${category.id}`}
                                    onChange={() =>
                                        handleCategoryChange(category.id)
                                    }
                                    checked={selectedCategories.includes(
                                        category.id
                                    )}
                                />
                                <label htmlFor={`category-${category.id}`}>
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
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
                    <div className="flex gap-5">
                        <button onClick={() => setSort("date")}>New</button>
                        <button onClick={() => setSort("ascending")}>
                            Price Ascending
                        </button>
                        <button onClick={() => setSort("descending")}>
                            Price Descending
                        </button>
                    </div>
                    <div>
                        <h1>Search Results for: {query}</h1>
                        {results.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {results.map((merch) => (
                                    <Link
                                        key={merch.id}
                                        className="card w-3/12"
                                        href={`/${merch.id}`}
                                    >
                                        {merch.merchandise_pictures &&
                                        merch.merchandise_pictures.length >
                                            0 ? (
                                            <Image
                                                alt={"loading"}
                                                width={50}
                                                height={50}
                                                src={
                                                    merch
                                                        .merchandise_pictures[0]
                                                        .picture_url
                                                }
                                            />
                                        ) : (
                                            <p>No image available</p>
                                        )}
                                        {merch.name} - $
                                        {merch.variants[0].original_price}{" "}
                                        {merch.variants[0].membership_price <
                                            merch.variants[0].original_price &&
                                        merch.variants[0].membership_price
                                            ? `/ ${merch.variants[0].membership_price}`
                                            : ""}
                                        <br />
                                        {merch.shops.acronym}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p>No products found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
