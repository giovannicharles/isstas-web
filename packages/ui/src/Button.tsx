import { cloneElement, isValidElement, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

// Sentence case, Montserrat 700, firm 8px corners; a sheen sweeps across solid buttons on hover.
const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full border-2 font-display font-bold leading-none no-underline [&_svg]:transition-transform [&_svg]:duration-200 group-hover/btn:[&_svg:last-child]:translate-x-1 ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:translate-y-px active:scale-[0.99] ' +
  'disabled:cursor-not-allowed disabled:opacity-55';

const sheen =
  "after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/3 after:w-1/3 after:-translate-x-full after:skew-x-[-20deg] after:bg-white/30 after:opacity-0 after:transition-[transform,opacity] after:duration-700 hover:after:translate-x-[420%] hover:after:opacity-100";

const sizes = {
  xs: 'min-h-9 px-3.5 text-[0.8rem]',
  sm: 'min-h-10 px-4 text-[0.9rem]',
  md: 'min-h-[52px] px-7 text-base',
  lg: 'min-h-[56px] px-8 text-[1.05rem]',
  icon: 'size-11 p-0',
} as const;

const variants = {
  primary: {
    light: `border-green-500 bg-green-500 text-white shadow-[0_10px_24px_-10px_rgb(61_122_95/0.7)] hover:-translate-y-0.5 hover:border-green-600 hover:bg-green-600 hover:shadow-[0_16px_30px_-12px_rgb(61_122_95/0.8)] ${sheen}`,
    dark: `border-white bg-white text-green-700 shadow-[0_10px_28px_-10px_rgb(20_42_34/0.6)] hover:-translate-y-0.5 hover:border-mint-100 hover:bg-mint-100 ${sheen}`,
  },
  secondary: {
    light: 'border-mint-200 bg-mint-100 text-green-800 hover:bg-mint-200',
    dark: 'border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20',
  },
  outline: {
    light: 'border-green-700 text-green-900 hover:bg-green-500 hover:text-white',
    dark: 'border-white/85 text-white hover:border-white hover:bg-white hover:text-green-700',
  },
  ghost: {
    light: 'border-transparent text-green-900 hover:bg-green-700/10',
    dark: 'border-transparent text-white hover:bg-white/12',
  },
  white: {
    light: 'border-white bg-white text-green-900 hover:bg-green-500 hover:border-green-700 hover:text-white',
    dark: 'border-white bg-white text-green-900 hover:bg-green-500 hover:border-green-700 hover:text-white',
  },
} as const;

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** what the button sits on, so outline/ghost stay legible on dark bands */
  tone?: 'light' | 'dark';
  fullWidth?: boolean;
  /** shadcn : rend l'enfant a la place du bouton (Slot Radix) */
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
};

type Props = Common &
  (
    | ({ to: string; href?: never } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)
    | ({ href: string; to?: never } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ to?: never; href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function buttonClasses({ variant = 'primary', size = 'md', tone = 'light', fullWidth, className }: Pick<Common, 'variant' | 'size' | 'tone' | 'fullWidth' | 'className'>) {
  return cn(base, sizes[size], variants[variant][tone], fullWidth && 'w-full', className);
}

export function Button({ variant, size, tone, fullWidth, asChild, className, children, ...rest }: Props) {
  const classes = buttonClasses({ variant, size, tone, fullWidth, className });
  const { to, href, ...props } = rest as { to?: string; href?: string } & Record<string, unknown>;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, { ...(props as object), className: cn(classes, child.props.className) });
  }
  if (to) return <Link to={to} className={classes} {...(props as object)}>{children}</Link>;
  if (href) return <a href={href} className={classes} {...(props as object)}>{children}</a>;
  return <button type="button" className={classes} {...(props as object)}>{children}</button>;
}