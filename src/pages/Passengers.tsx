import { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import PassengerList from '@/components/passenger/PassengerList';
import AddPassengerForm from '@/components/passenger/AddPassengerForm';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { generatePassengerExcel } from '@/lib/supabase';

const Passengers = () => {
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await generatePassengerExcel();
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="pb-28 px-8 pt-4 container w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold mb-1">Manajemen Penumpang</h1>
        <Button 
          variant="outline" 
          onClick={handleExportExcel}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </Button>
      </motion.div>
      
      <PassengerList />
      
      <FloatingActionButton onClick={() => setIsAddPassengerOpen(true)} />
      <AddPassengerForm isOpen={isAddPassengerOpen} onClose={() => setIsAddPassengerOpen(false)} />
      
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