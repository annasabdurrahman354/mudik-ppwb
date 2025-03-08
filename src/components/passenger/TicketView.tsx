
import { Passenger } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';

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
        const content = ticketRef.current;
        const printWindow = window.open('', '_blank');
        
        if (content && printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Bus Ticket - ${passenger.name}</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                    padding: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                  }
                  .ticket {
                    border: 2px solid #000;
                    border-radius: 12px;
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                  }
                  .ticket:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 8px;
                    background: #3B82F6;
                  }
                  .destination {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                    margin-top: 5px;
                  }
                  .seat-number {
                    font-size: 46px;
                    font-weight: bold;
                    text-align: center;
                    margin: 30px 0;
                  }
                  .passenger-details {
                    border-top: 1px dashed #ccc;
                    padding-top: 15px;
                  }
                  .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                  }
                  .detail-label {
                    font-weight: 600;
                    color: #4B5563;
                  }
                  @media print {
                    body {
                      padding: 0;
                    }
                    .ticket {
                      border: none;
                      padding: 10px;
                    }
                    .print-button {
                      display: none;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="ticket">
                  <div class="destination">
                    Bus ${passenger.destination} #${passenger.bus?.bus_number || ''}
                  </div>
                  <div class="seat-number">
                    No. ${passenger.bus_seat_number}
                  </div>
                  <div class="passenger-details">
                    <div class="detail-row">
                      <span class="detail-label">Nama:</span>
                      <span>${passenger.name}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Klp:</span>
                      <span>${passenger.group_pondok}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Tujuan:</span>
                      <span>${passenger.destination}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Pembayaran:</span>
                      <span>Rp.${passenger.total_payment}</span>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `);
          
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }
      } catch (error) {
        console.error('Error printing ticket:', error);
        toast.error('Failed to print ticket');
      } finally {
        setIsPrinting(false);
      }
    }, 500);
  };
  
  if (!passenger.bus) {
    return <div className="text-center text-muted-foreground">No bus assigned</div>;
  }
  
  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-2 border-primary/20 rounded-xl overflow-hidden shadow-md"
        ref={ticketRef}
      >
        <div className="h-2 bg-primary" />
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-center">
            Bus {passenger.destination} #{passenger.bus.bus_number}
          </h3>
          
          <div className="text-[4rem] font-bold text-center my-8 text-primary">
            No. {passenger.bus_seat_number}
          </div>
          
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Nama:</span>
              <span>{passenger.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Klp:</span>
              <span>{passenger.group_pondok}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Tujuan:</span>
              <span>{passenger.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Total Pembayaran:</span>
              <span>Rp. {passenger.total_payment}</span>
            </div>
          </div>
        </div>
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
