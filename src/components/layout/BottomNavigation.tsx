
import { Bus, Users } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import FloatingActionButton from './FloatingActionButton';

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="glass shadow-xl border border-gray-100 rounded-2xl mx-auto">
        <nav className="flex justify-evenly h-16 px-2 my-2">
          <Link 
            to="/buses" 
            className={cn(
              "bottom-nav-item relative no-tap-highlight",
              path.startsWith('/buses') ? "text-primary" : "text-muted-foreground"
            )}
          >
            {path.startsWith('/buses') && (
              <motion.span 
                layoutId="nav-indicator"
                className="absolute inset-0 bg-primary/10 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Bus size={20} />
            <span className="text-md">Bus</span>
          </Link>
          <Link 
            to="/passengers" 
            className={cn(
              "bottom-nav-item relative no-tap-highlight",
              path.startsWith('/passengers') ? "text-primary" : "text-muted-foreground"
            )}
          >
            {path.startsWith('/passengers') && (
              <motion.span 
                layoutId="nav-indicator"
                className="absolute inset-0 bg-primary/10 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Users size={20} />
            <span className="text-md">Penumpang</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default BottomNavigation;
