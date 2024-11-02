"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import React, { ReactNode, useState } from "react";
import { PlaceholdersAndVanishInput } from "./placeholders-and-vanish-input";
import { onDisconnect, writeCharacteristics } from "@/api/ble";
import { MultiStepLoaderDemo } from "./multi-step-loader";
import { requestDeviceOnly, connectToDevice } from "@/api/ble";
import { ButtonsCard } from "../ui/tailwindcss-buttons"
import reactElementToJSXString from "react-element-to-jsx-string";
import { toast, Toaster } from "sonner";

// import Header from "../header";
export function TailwindcssButtons() {
    const copy = (button: any) => {
      if (button.code) {
        copyToClipboard(button.code);
        return;
      }
      let buttonString = reactElementToJSXString(button.component);
   
      if (buttonString) {
        const textToCopy = buttonString;
        copyToClipboard(textToCopy);
      }
    };
   
    const copyToClipboard = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied to clipboard:", text);
          toast.success("Copied to clipboard");
        })
        .catch((err) => {
          console.error("Error copying text to clipboard:", err);
          toast.error("Error copying to clipboard");
        });
    };
    return (
      <div className="pb-40 px-4 w-full">
        <Toaster position="top-center" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full  max-w-7xl mx-auto gap-10">
          {buttons.map((button, idx) => (
            <ButtonsCard key={idx} onClick={() => copy(button)}>
              {button.component}
            </ButtonsCard>
          ))}
        </div>
      </div>
    );
  }


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
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        const deviceSelected = await requestDeviceOnly();
        if (deviceSelected) {
          setLoading(true); // デバイス選択後にローディングを開始
          const connected = await connectToDevice();
          setLoading(false); // 接続が完了したらローディングを停止
    
          if (!connected) {
            alert("接続に失敗しました。");
          }
        } else {
          alert("デバイスが選択されませんでした。");
        }
      };

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
            <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
              What robots write?
            </h2>
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
            <div className="flex flex-row sm:mt-20 items-center gap-2">
              {/* <p>ロボットの接続</p> */}
            <button
                className="px-6 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400"
                onClick={handleScan} // handleScanを実行
            >
                Scan
            </button>
            <button 
                className="px-6 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400"
                onClick={onDisconnect}
            >
                Disconnection
            </button>
            </div>
          </motion.div>
          <MultiStepLoaderDemo loading={loading} setLoading={setLoading} /> {/* loadingとsetLoadingを渡す */}
        </AuroraBackground>
      );
    };

export const buttons = [
    {
        name: "Figma",
        description: "Figma button for your website",
        component: (
          <button className="px-6 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">
            Figma
          </button>
        ),
      },];
      