import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addBus, PREDEFINED_DESTINATIONS } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AddBusFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddBusForm = ({ isOpen, onClose }: AddBusFormProps) => {
  const [destination, setDestination] = useState<string>('');
  const [customDestination, setCustomDestination] = useState<string>('');
  const [maxPassengers, setMaxPassengers] = useState<number>(50);
  const [farePerPassenger, setFarePerPassenger] = useState<number>(100000);
  const [mealCount, setMealCount] = useState<number>(0);
  const [mealPrice, setMealPrice] = useState<number>(20000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const finalDestination = destination === 'custom' ? customDestination : destination;
      
      if (!finalDestination) {
        toast.error('Please select or enter a destination');
        return;
      }
      
      await addBus({
        destination: finalDestination,
        max_passengers: maxPassengers,
        fare_per_passenger: farePerPassenger,
        meal_count: mealCount,
        meal_price: mealPrice
      });
      
      toast.success('Bus added successfully');
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding bus:', error);
      toast.error('Failed to add bus');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setDestination('');
    setCustomDestination('');
    setMaxPassengers(50);
    setFarePerPassenger(100000);
    setMealCount(0);
    setMealPrice(20000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambahkan Bus Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Pilih Tujuan" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_DESTINATIONS.map(dest => (
                  <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                ))}
                <SelectItem value="custom">Tujuan Kustom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {destination === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDestination">Tujuan Kustom</Label>
              <Input
                id="customDestination"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                placeholder="Masukkan tujuan kustom"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="maxPassengers">Maksimal Penumpang</Label>
            <Input
              id="maxPassengers"
              type="number"
              min="1"
              disabled
              max="100"
              value={maxPassengers}
              onChange={(e) => setMaxPassengers(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="farePerPassenger">Tarif per Penumpang (Rp)</Label>
            <Input
              id="farePerPassenger"
              type="number"
              min="1"
              value={farePerPassenger}
              onChange={(e) => setFarePerPassenger(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mealCount">Jumlah Makanan</Label>
            <Input
              id="mealCount"
              type="number"
              min="0"
              value={mealCount}
              onChange={(e) => setMealCount(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mealPrice">Harga Makanan (Rp)</Label>
            <Input
              id="mealPrice"
              type="number"
              min="0"
              value={mealPrice}
              onChange={(e) => setMealPrice(parseInt(e.target.value))}
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menambahkan...' : 'Tambahkan Bus'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusForm;