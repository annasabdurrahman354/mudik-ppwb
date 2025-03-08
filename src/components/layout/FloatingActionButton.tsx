
import { PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fab fixed z-40 right-4 bottom-28 w-12 h-12 bg-primary text-primary-foreground shadow-xl",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
    >
      <PlusIcon size={24} />
    </motion.button>
  );
};

export default FloatingActionButton;
