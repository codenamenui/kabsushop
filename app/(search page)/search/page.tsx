"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

type Shop = {
    id: number;
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
    const shopParam = searchParams.get("shop");
    const [shops, setShops] = useState<Shop[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedShops, setSelectedShops] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [results, setResults] = useState<Merch[]>([]);
    const router = useRouter(); // Initialize useRouter
    const [sort, setSort] = useState("date");

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
    }, []);

    // Fetch shops
    useEffect(() => {
        const getShops = async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("id, acronym");
            setShops(data);
        };
        getShops();
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

        if (shops.length > 0) {
            // Filter the data to only include items that belong to selected shops
            filteredResults = filteredResults.filter((item) => {
                return shops.includes(item.shops?.id);
            });
        }

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

        if (shopParam) {
            const shopIds = shopParam.split(",").map(Number);
            setSelectedShops(shopIds); // Set selected shops from URL param
        }

        fetchMerchandises(query, selectedCategories, selectedShops);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, categoryParam, shopParam, sort]); // Listen for changes in query, categoryParam, and shopParam

    // Handle category change
    const handleCategoryChange = (categoryId: number) => {
        const updatedSelected = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(updatedSelected);

        // Update the URL with the new search parameters
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("category", updatedSelected.join(",")); // Set the 'category' param to the selected IDs
        router.push(`/search?${queryParams.toString()}`); // Update the URL without reloading
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
                    <div>
                        <p>Shops</p>
                        {shops.map((shop) => (
                            <div
                                key={shop.id}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    id={`shop-${shop.id}`}
                                    onChange={() => handleShopChange(shop.id)}
                                    checked={selectedShops.includes(shop.id)}
                                />
                                <label htmlFor={`shop-${shop.id}`}>
                                    {shop.acronym}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
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
                            <ul className="flex flex-col gap-2">
                                {results.map((merch) => (
                                    <li key={merch.id} className="card w-3/12">
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
                                    </li>
                                ))}
                            </ul>
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
