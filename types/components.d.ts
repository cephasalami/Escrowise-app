import { ReactNode } from "react";

declare module "@/lib/supabase" {
  const supabase: any;
  export default supabase;
}

declare module "@/components/ui/button" {
  export interface ButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
  }
  export const Button: React.FC<ButtonProps>;
}

declare module "@/components/ui/input" {
  export interface InputProps {
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }
  export const Input: React.FC<InputProps>;
}

declare module "@/components/ui/textarea" {
  export interface TextareaProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
  }
  export const Textarea: React.FC<TextareaProps>;
}

declare module "@/components/ui/card" {
  export interface CardProps {
    className?: string;
  }
  export const Card: React.FC<CardProps>;
  export const CardContent: React.FC<CardProps>;
}

declare module "@/components/ui/image-annotator" {
  export interface ImageAnnotatorProps {
    image: string;
    onAnnotationSave: (annotation: string) => void;
    className?: string;
  }
  export const ImageAnnotator: React.FC<ImageAnnotatorProps>;
}
