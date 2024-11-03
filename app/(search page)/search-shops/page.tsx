"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams

const SearchShops = () => {
    const supabase = createClientComponentClient();
    const searchParams = useSearchParams(); // Get search parameters from URL
    const query = searchParams.get("query"); // Get the query parameter
    const [shops, setShops] = useState<any[]>([]);
    const [filteredShops, setFilteredShops] = useState<any[]>([]); // State for filtered shops

    useEffect(() => {
        const getShops = async () => {
            const { data, error } = await supabase
                .from("shops")
                .select(`id, name, merchandises(id)`, { count: "exact" });

            if (error) {
                console.error("Error fetching shops:", error);
            } else {
                setShops(data);
            }
        };
        getShops();
    }, [supabase]);

    // Filter shops based on the query
    useEffect(() => {
        if (query) {
            const filtered = shops.filter((shop) =>
                shop.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredShops(filtered);
        } else {
            setFilteredShops(shops); // Reset to all shops if there's no query
        }
    }, [query, shops]);

    return (
        <div className="search-shops">
            <h1>Search Shops</h1>

            {/* Display the filtered shops */}
            <ul className="shop-list">
                {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <li key={shop.id} className="shop-item border p-4 mb-2">
                            <h2>{shop.name}</h2>
                            <p>Product Count: {shop.merchandises.length}</p>
                        </li>
                    ))
                ) : (
                    <p>No shops found.</p>
                )}
            </ul>
        </div>
    );
};

export default SearchShops;
