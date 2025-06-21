import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  loading = false,
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600",
    outline: "border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10",
    ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        loading && "cursor-not-allowed opacity-70",
        className
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };