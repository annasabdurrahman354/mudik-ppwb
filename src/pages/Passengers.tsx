import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import PassengerList from '@/components/passenger/PassengerList';
import AddPassengerForm from '@/components/passenger/AddPassengerForm';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { generatePassengerExcel, getActivePeriod } from '@/lib/supabase';
import { Link } from 'react-router-dom';

const Passengers = () => {
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: activePeriod, isLoading: isLoadingPeriod } = useQuery({
    queryKey: ['activePeriod'],
    queryFn: getActivePeriod,
  });
  
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await generatePassengerExcel(activePeriod?.id);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="pb-28 px-8 pt-4 container w-full mx-auto max-w-5xl">
       <div className="py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-1">Manajemen Penumpang</h1>
          {isLoadingPeriod ? (
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
          ) : activePeriod ? (
            <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-primary">
              Periode: {activePeriod.name}
            </Badge>
          ) : (
             <div className="flex items-center gap-2 mt-2">
               <Badge variant="destructive">Tidak ada periode aktif</Badge>
               <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary">
                 <Link to="/periods">Atur Periode</Link>
               </Button>
            </div>
          )}
        </motion.div>

        {activePeriod && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              className="flex items-center gap-2"
              disabled={isExporting}
            >
              <FileSpreadsheet size={18} />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </Button>
          </motion.div>
        )}
      </div>
      
      <PassengerList activePeriodId={activePeriod?.id} />
      
      {activePeriod && activePeriod.status !== 'LOCKED' && (
        <>
          <FloatingActionButton onClick={() => setIsAddPassengerOpen(true)} />
          <AddPassengerForm 
            isOpen={isAddPassengerOpen} 
            onClose={() => setIsAddPassengerOpen(false)} 
            periodId={activePeriod.id}
          />
        </>
      )}
      
      {/* Loading Dialog */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Exporting Data</h3>
            <p className="text-muted-foreground">Generating Excel file, please wait...</p>
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation />
    </div>
  );
};

export default Passengers;