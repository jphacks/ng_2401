// src/components/header.tsx
"use client";

import React, { useState, useEffect } from "react";

const Header = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <header className="bg-gray-100 dark:bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1
                    onClick={toggleDarkMode}
                    className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer"
                    title="Toggle Dark Mode"
                >
                    jphacks App
                </h1>
            </div>
        </header>
    );
};

export default Header;
