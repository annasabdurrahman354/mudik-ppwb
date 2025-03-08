
import { Passenger } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';
import PassengerTicketCard from './PassengerTicketCard';

interface TicketViewProps {
  passenger: Passenger;
}

const TicketView = ({ passenger }: TicketViewProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    setIsPrinting(true);
  
    setTimeout(() => {
      try {
        const content = document.getElementById("print");
        if (!content) {
          toast.error("Failed to find ticket content");
          setIsPrinting(false);
          return;
        }
  
        const printWindow = window.open("", "_blank");
  
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Bus Ticket - ${passenger.name}</title>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
                <style>
                  @media print {
                    body {
                      background: white;
                      margin: 0;
                      padding: 0;
                    }
                    #print {
                      box-shadow: none;
                      border: none;
                    }
                  }
                </style>
              </head>
              <body>
                <div id="print" class="p-6">${content.innerHTML}</div>
                <script>
                  window.onload = function() {
                    window.print();
                    window.onafterprint = function() { window.close(); };
                  };
                </script>
              </body>
            </html>
          `);
  
          printWindow.document.close();
        }
      } catch (error) {
        console.error("Error printing ticket:", error);
        toast.error("Failed to print ticket");
      } finally {
        setIsPrinting(false);
      }
    }, 500);
  };
  
  
  if (!passenger.bus) {
    return <div className="text-center text-muted-foreground">No bus assigned</div>;
  }
  
  return (
    <div className="w-fit mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-2 border-primary/20 rounded-xl overflow-hidden shadow-md"
        ref={ticketRef}
      >
        <div className="h-2 bg-primary" />
        
        <PassengerTicketCard passenger={passenger} />
      </motion.div>
      
      <div className="mt-6 text-center">
        <Button 
          onClick={handlePrint} 
          disabled={isPrinting} 
          className="px-6"
        >
          <PrinterIcon className="mr-2 h-4 w-4" />
          {isPrinting ? 'Mempersiapkan pencetakan...' : 'Cetak Tiket'}
        </Button>
      </div>
    </div>
  );
};

export default TicketView;
