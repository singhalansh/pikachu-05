"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Abhiyaan {
    id: string;
    name: string;
    description: string;
    creator_name: string;
    location: string;
    time: string;
}

export default function AdminAbhiyaanPage() {
    const supabase = createClient();
    const [abhiyaans, setAbhiyaans] = useState<Abhiyaan[]>([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [creatorName, setCreatorName] = useState("");
    const [location, setLocation] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        fetchAbhiyaans();
    }, []);

    const fetchAbhiyaans = async () => {
        const { data, error } = await (supabase as any)
            .from("abhiyaans")
            .select("*")
            .order("time", { ascending: true });
        if (error) console.error(error);
        else setAbhiyaans(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !creatorName || !location || !time)
            return alert("Fill all fields");

        const { error } = await (supabase as any)
            .from("abhiyaans")
            .insert([
                {
                    name,
                    description,
                    creator_name: creatorName,
                    location,
                    time,
                },
            ]);

        if (error) alert("Failed to add Abhiyaan");
        else {
            alert("Abhiyaan added!");
            setName("");
            setDescription("");
            setCreatorName("");
            setLocation("");
            setTime("");
            fetchAbhiyaans();
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        const { error } = await (supabase as any)
            .from("abhiyaans")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete error:", error);
            alert("Failed to delete Abhiyaan");
        } else {
            alert("Abhiyaan deleted successfully!");
            fetchAbhiyaans();
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Abhiyaans</h1>
            <form onSubmit={handleSubmit} className="space-y-4 mb-10">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Creator Name"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Add Abhiyaan
                </button>
            </form>

            <h2 className="text-2xl font-semibold mb-4">All Abhiyaans</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {abhiyaans.map((a) => (
                        <div
                            key={a.id}
                            className="border rounded-xl p-4 shadow relative"
                        >
                            <h3 className="text-xl font-semibold">{a.name}</h3>
                            <p className="mt-2 text-gray-600">{a.description}</p>
                            <p className="text-sm mt-2">By: {a.creator_name}</p>
                            <p className="text-sm">Location: {a.location}</p>
                            <p className="text-sm">
                                Time: {new Date(a.time).toLocaleString()}
                            </p>
                            <button
                                onClick={() => handleDelete(a.id, a.name)}
                                className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                title="Delete Abhiyaan"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
