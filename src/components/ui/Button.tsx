import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/styles/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800",
  {
    variants: {
      variant: {
        default:
          "bg-green text-white hover:bg-green-700",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600",
        outline:
          "bg-transparent border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100",
        subtle:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100",
        ghost:
          "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline text-zinc-900 dark:text-zinc-100 hover:bg-transparent dark:hover:bg-transparent",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-xl",
        lg: "h-12 px-8 rounded-md"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
