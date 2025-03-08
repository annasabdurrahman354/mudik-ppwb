
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { fetchBuses, addPassenger, getAvailableSeatsCount } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AddPassengerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPassengerForm = ({ isOpen, onClose }: AddPassengerFormProps) => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState<string>('');
  const [groupPondok, setGroupPondok] = useState<string>('');
  const [busId, setBusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [busAvailability, setBusAvailability] = useState<Record<string, number>>({});
  
  const queryClient = useQueryClient();
  
  // Load buses and their availability
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const busesData = await fetchBuses();
        setBuses(busesData);
        
        // Check availability for each bus
        const availability: Record<string, number> = {};
        for (const bus of busesData) {
          const availableSeats = await getAvailableSeatsCount(bus.id);
          availability[bus.id] = availableSeats;
        }
        
        setBusAvailability(availability);
      } catch (error) {
        console.error('Error loading buses:', error);
        toast.error('Failed to load buses');
      }
    };
    
    if (isOpen) {
      loadBuses();
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get bus destination
      const selectedBus = buses.find(bus => bus.id === busId);
      
      if (!selectedBus) {
        toast.error('Please select a valid bus');
        return;
      }
      
      await addPassenger({
        name,
        gender,
        address,
        destination: selectedBus.destination,
        group_pondok: groupPondok,
        bus_id: busId
      });
      
      toast.success('Passenger added successfully');
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding passenger:', error);
      toast.error('Failed to add passenger');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setGender('L');
    setAddress('');
    setGroupPondok('');
    setBusId('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Passenger</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'L' | 'P')} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="L" id="male" />
                <Label htmlFor="male">Male (L)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="P" id="female" />
                <Label htmlFor="female">Female (P)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupPondok">Group Pondok</Label>
            <Input
              id="groupPondok"
              value={groupPondok}
              onChange={(e) => setGroupPondok(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bus">Select Bus</Label>
            <Select value={busId} onValueChange={setBusId}>
              <SelectTrigger id="bus">
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map(bus => {
                  const isAvailable = (busAvailability[bus.id] || 0) > 0;
                  return (
                    <SelectItem 
                      key={bus.id} 
                      value={bus.id}
                      disabled={!isAvailable}
                    >
                      {`${bus.destination}#${bus.bus_number}`}
                      {isAvailable 
                        ? ` (${busAvailability[bus.id]} seats available)` 
                        : ' (FULL)'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {buses.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No buses available. Please add a bus first.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || buses.length === 0}>
              {isLoading ? 'Adding...' : 'Add Passenger'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPassengerForm;
