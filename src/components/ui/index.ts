/**
 * UI Components Export
 *
 * Central export file for all custom UI components.
 * Includes both shadcn components and custom components.
 */

// Base Layout Components
export { Section } from './section';
export { Container } from './container';

// Typography Components
export { Heading } from './heading';
export { Text } from './text';

// Navigation Components
export { Link } from './link';

// Card Components
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

export {
  AnimatedCard,
  CardContent as AnimatedCardContent,
  CardDescription as AnimatedCardDescription,
  CardFooter as AnimatedCardFooter,
  CardHeader as AnimatedCardHeader,
  CardTitle as AnimatedCardTitle,
} from './animated-card';

// shadcn UI Components
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './form';
export { Checkbox } from './checkbox';
export { Switch } from './switch';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';
export { Separator } from './separator';
export { Badge, badgeVariants } from './badge';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './navigation-menu';
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

// Type exports
export type { SectionProps } from './section';
export type { ContainerProps } from './container';
export type { HeadingProps } from './heading';
export type { TextProps } from './text';
export type { LinkProps } from './link';
export type { AnimatedCardProps } from './animated-card';
