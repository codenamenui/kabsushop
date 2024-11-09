"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Variant = {
    picture_url: File;
    name: string;
    original_price?: any;
    membership_price?: any;
    merch_id: number;
    sizes?: {
        name: string;
        original_price?: any;
        membership_price?: any;
    };
};

const Merch = () => {
    const { id, slug: shopId } = useParams();
    const [name, setName] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [variants, setVariants] = useState<Variant[]>([
        {
            name: "",
            picture_url: null,
            original_price: 1,
            membership_price: 1,
            merch_id: null,
        },
    ]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [merchPics, setMerchPics] = useState<File[]>([]);
    const [categories, setCategories] = useState([]);
    const [discount, setDiscount] = useState(false);
    const router = useRouter();
    const [cancel, setCancel] = useState(false);
    const [physical, setPhysical] = useState(false);
    const [online, setOnline] = useState(false);
    const [rece, setRece] = useState("");

    useEffect(() => {
        const getOptions = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase.from("categories").select();
            setCategories(data);
        };
        getOptions();
    }, []);

    const handleAddCategory = (e) => {
        const newCategoryId = e.target.value;
        if (newCategoryId && !selectedCategories.includes(newCategoryId)) {
            console.log(newCategoryId);
            setSelectedCategories((prev) => [...prev, newCategoryId]);
        }
        // Reset the select field after selection
        e.target.value = "";
    };

    const handleRemoveCategory = (id) => {
        setSelectedCategories((prev) => prev.filter((catId) => catId !== id));
    };

    // Function to add a variant with an empty name, picture, and price
    const addVariant = () => {
        setVariants([
            ...variants,
            {
                name: "",
                picture_url: null,
                original_price: 1,
                membership_price: 1,
                merch_id: null,
            },
        ]);
    };

    // Function to remove variant by index
    const removeVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i != index));
    };

    // Function to remove merchandise picture by index
    const removeMerchPic = (index: number) => {
        setMerchPics((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior
        const supabase = createClientComponentClient();
        try {
            // Insert merchandise into database
            const { data: merch, error: insertError } = await supabase
                .from("merchandises")
                .insert([
                    {
                        name: name,
                        description: desc,
                        shop_id: shopId,
                        online_payment: online ? online : false,
                        physical_payment: physical ? physical : false,
                        cancellable: cancel ? cancel : false,
                        receiving_information: rece,
                    },
                ])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }
            // Upload merchandise pictures
            for (let i = 0; i < merchPics.length; i++) {
                const merch_url = `merch_${name}_${i + 1}_${Date.now()}.png`;
                const { error: storageError } = await supabase.storage
                    .from("merch-picture")
                    .upload(merch_url, merchPics[i]);

                if (storageError) {
                    throw storageError;
                }

                const {
                    data: { publicUrl: merchUrl },
                } = supabase.storage
                    .from("merch-picture")
                    .getPublicUrl(merch_url);

                const { error: merch_error } = await supabase
                    .from("merchandise_pictures")
                    .insert([{ picture_url: merchUrl, merch_id: merch.id }]);

                if (merch_error) {
                    throw merch_error;
                }
            }
            // Upload variants
            for (let i = 0; i < variants.length; i++) {
                const variant_url = `variant_${name}_${
                    i + 1
                }_${Date.now()}.png`;
                console.log(variants[i].picture_url);
                if (variants[i].picture_url) {
                    const { error: storageError } = await supabase.storage
                        .from("variant-picture")
                        .upload(variant_url, variants[i].picture_url);

                    if (storageError) {
                        throw storageError;
                    }

                    const {
                        data: { publicUrl: variantUrl },
                    } = supabase.storage
                        .from("variant-picture")
                        .getPublicUrl(variant_url);

                    const { data, error: merch_error } = await supabase
                        .from("variants")
                        .insert([
                            {
                                picture_url: variantUrl,
                                name: variants[i].name,
                                original_price: variants[i].original_price,
                                membership_price: discount
                                    ? variants[i].membership_price
                                    : variants[i].original_price,
                                merch_id: merch.id,
                            },
                        ])
                        .select();
                    console.log(data);
                    if (merch_error) {
                        throw merch_error;
                    }
                }
            }
            for (let i = 0; i < selectedCategories.length; i++) {
                const { error: cat_error } = await supabase
                    .from("merchandise_categories")
                    .insert([
                        {
                            cat_id: selectedCategories[i],
                            merch_id: merch.id,
                        },
                    ]);

                if (cat_error) {
                    throw cat_error;
                }
            }
            console.log("Successful!");
            router.push(`/manage/shop/${shopId}/merch/${id}`);
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div>
            <div className="text-red-700">
                <h1>Add Merchandise</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="form-input"
                        />
                    </label>

                    <label>
                        Description:
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            required
                            className="textarea"
                        />
                    </label>

                    <label>
                        Receving Information:
                        <textarea
                            value={rece}
                            onChange={(e) => setRece(e.target.value)}
                            required
                            className="textarea"
                        />
                    </label>

                    <label htmlFor="" className="flex flex-col gap-1">
                        Categories
                        <div className="flex gap-2 card">
                            {selectedCategories.map((categoryId) => {
                                const category = categories.find(
                                    (cat) => cat.id == categoryId
                                );
                                return (
                                    <div
                                        key={categoryId}
                                        className="flex items-center card"
                                    >
                                        <span>{category?.name}</span>
                                        <button
                                            onClick={() =>
                                                handleRemoveCategory(categoryId)
                                            }
                                            className="ml-2 text-red-500 button-outline"
                                        >
                                            -
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <select
                            name="categories"
                            onChange={handleAddCategory}
                            className="dropdown"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => {
                                return (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label>
                        Merch Pictures:
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                ) {
                                    setMerchPics((prev) => [
                                        ...prev,
                                        ...Array.from(e.target.files),
                                    ]);
                                    setTimeout(() => {
                                        e.target.value = "";
                                    }, 0);
                                }
                            }}
                            className="form-input"
                        />
                    </label>

                    {merchPics.length > 0 && (
                        <div className="file-list">
                            <h3 className="text-lg font-medium">
                                Selected Merch Pictures:
                            </h3>
                            <ul className="flex flex-wrap flex-col gap-2">
                                {merchPics.map((file, index) => (
                                    <li key={index} className="file-item card">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            width={100}
                                            height={100}
                                            className="object-contain"
                                        />
                                        <p>{file.name}</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeMerchPic(index)
                                            }
                                            className="remove-button"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <h3 className="text-lg font-medium">Variants</h3>
                    {variants &&
                        variants.map((variant, index) => (
                            <div key={index} className="flex flex-col">
                                <label>
                                    Variant Name:
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              name: e.target
                                                                  .value,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                <label>
                                    Original Price:
                                    <input
                                        type="number"
                                        value={variant.original_price}
                                        min="1"
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              original_price:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                <label>
                                    Membership:
                                    <input
                                        type="checkbox"
                                        onChange={() => {
                                            setDiscount(!discount);
                                        }}
                                    />
                                </label>

                                {discount && (
                                    <label>
                                        Membership Price:
                                        <input
                                            type="number"
                                            value={variant.membership_price}
                                            min="1"
                                            onChange={(e) =>
                                                setVariants((prev) =>
                                                    prev.map((v, i) =>
                                                        i == index
                                                            ? {
                                                                  ...v,
                                                                  membership_price:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : v
                                                    )
                                                )
                                            }
                                            className="form-input"
                                        />
                                    </label>
                                )}

                                <label>
                                    Variant Picture:
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              picture_url:
                                                                  e.target
                                                                      .files?.[0] ||
                                                                  null,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                {variant.picture_url && (
                                    <Image
                                        src={URL.createObjectURL(
                                            variant.picture_url
                                        )}
                                        alt={variant.name}
                                        width={100}
                                        height={100}
                                        className="object-cover my-2"
                                    />
                                )}

                                {index != 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="remove-button mt-2"
                                    >
                                        Remove Variant
                                    </button>
                                )}
                            </div>
                        ))}

                    <button
                        type="button"
                        onClick={addVariant}
                        className="button"
                    >
                        Add Variant
                    </button>

                    <label>
                        Cancellable:
                        <input
                            type="checkbox"
                            checked={cancel}
                            onChange={() => {
                                setCancel(!cancel);
                            }}
                        />
                    </label>

                    <label>
                        Allow In Person Payment:
                        <input
                            type="checkbox"
                            checked={physical}
                            onChange={() => {
                                setPhysical(!physical);
                            }}
                        />
                    </label>

                    <label>
                        Allow Online Payment:
                        <input
                            type="checkbox"
                            checked={online}
                            onChange={() => {
                                setOnline(!online);
                            }}
                        />
                    </label>

                    <button type="submit" className="button mt-4">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Merch;
