"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import React, { ReactNode, useState } from "react";
import { PlaceholdersAndVanishInput } from "./placeholders-and-vanish-input";
import { onDisconnect, startScan, writeCharacteristics } from "@/api/ble";
// import Header from "../header";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}
  var inputText = "";

  const placeholders = [
    "I'm good meet you!",
    "What's good?",
    "Have a nice day!",
    "Hi, there!",
    "I'm excited!",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputText = e.target.value;
  };
  
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(inputText);
    writeCharacteristics(inputText);
  };

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

// Content that was originally in page.tsx

export const AuroraBackgroundDemo = () => {

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          XXXX YYYY
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          created by H-Milk
        </div> */}
        {/* <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2"> */}
          {/* Start */}
        {/* </button> */}

        <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
        How are you today?
        </h2>
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
        <div className="flex flex-row sm:mt-20 items-center gap-2">
          <p>
            ロボットの接続 
          </p>
          <button 
            className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2" 
            onClick={startScan}>
            スキャン
          </button>
          <button 
            className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2" 
            onClick={onDisconnect}>
            切断
          </button>
        </div>
      </motion.div>
    </AuroraBackground>
  );
};