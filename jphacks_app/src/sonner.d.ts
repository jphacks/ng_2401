declare module "sonner" {
  import React from "react";

  // toast関数の型定義
  interface ToastOptions {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | undefined;
  }

  type ToastFunction = (message: string, options?: ToastOptions) => void;

  export const toast: {
    (message: string, options?: ToastOptions): void;
    success: ToastFunction;
    error: ToastFunction;
    // 必要に応じて他の関数も追加
  };

  // Toasterコンポーネントの型定義
  export const Toaster: React.FC<{ position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" }>;
}
