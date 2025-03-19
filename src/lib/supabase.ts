
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://kcowmghdgmumnkaqngiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb3dtZ2hkZ211bW5rYXFuZ2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzOTU0ODIsImV4cCI6MjA1Njk3MTQ4Mn0.kD50v_oFQMd_wtVPBd-vUpWLQUe_12hCnSXnyF-dxCI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our application
export type Bus = {
  id: string;
  destination: string;
  bus_number: number;
  max_passengers: number;
  meal_count: number;
  meal_price: number;
  fare_per_passenger: number;
  created_at: string;
};

export type Passenger = {
  id: string;
  name: string;
  gender: 'L' | 'P';
  address: string;
  phone: string;
  destination: string;
  status: string;
  group_pondok: string;
  bus_seat_number: number;
  meal_count: number;
  meal_payment: number;
  total_payment: number;
  petugas: string;
  bus_id: string | null;
  created_at: string;
  // For UI only, not in database
  bus?: Bus;
};

// Destinations
export const PREDEFINED_DESTINATIONS = [
  'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Solo', 'Malang', 'Semarang', 'Bali'
];

export const PREDEFINED_PASSENGER_STATUS = [
  'pondok', 'umum'
];

// Helper functions
export async function fetchBuses() {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .order('destination', { ascending: true })
    .order('bus_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching buses:', error);
    throw error;
  }
  
  return data as Bus[];
}

export async function fetchPassengers() {
  const { data, error } = await supabase
    .from('passengers')
    .select(`
      *,
      bus:buses(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching passengers:', error);
    throw error;
  }
  
  return data as Passenger[];
}

export async function fetchPassengerById(id: string) {
  const { data, error } = await supabase
    .from('passengers')
    .select(`
      *,
      bus:buses(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching passenger:', error);
    throw error;
  }
  
  return data as Passenger;
}

export async function fetchBusById(id: string) {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching bus:', error);
    throw error;
  }
  
  return data as Bus;
}

export async function addBus(bus: Omit<Bus, 'id' | 'created_at' | 'bus_number'>) {
  // Get the next bus number for this destination
  const { data: lastBus } = await supabase
    .from('buses')
    .select('bus_number')
    .eq('destination', bus.destination)
    .order('bus_number', { ascending: false })
    .limit(1);
  
  const nextBusNumber = lastBus && lastBus.length > 0 ? (lastBus[0].bus_number + 1) : 1;
  
  const { data, error } = await supabase
    .from('buses')
    .insert([{ ...bus, bus_number: nextBusNumber }])
    .select();
  
  if (error) {
    console.error('Error adding bus:', error);
    throw error;
  }
  
  return data[0] as Bus;
}

export async function updatePassenger(id: string, updatedFields: Partial<Passenger>) {
  const { data, error } = await supabase
    .from('passengers')
    .update(updatedFields)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating passenger:', error);
    throw error;
  }
  
  return data[0] as Passenger;
}

export async function addPassenger(passenger: Omit<Passenger, 'id' | 'created_at' | 'total_payment'> & { bus_id: string }) {
  // Get the selected bus details
  const bus = await fetchBusById(passenger.bus_id);
  
  // Calculate total payment based on bus fare
  const totalPayment = bus.fare_per_passenger + (passenger.meal_count * bus.meal_price);
  
  const { data, error } = await supabase
    .from('passengers')
    .insert([{ 
      ...passenger, 
      total_payment: totalPayment 
    }])
    .select();
  
  if (error) {
    console.error('Error adding passenger:', error);
    throw error;
  }
  
  return data[0] as Passenger;
}

export async function getAvailableSeatsCount(busId: string) {
  // Get the bus details
  const bus = await fetchBusById(busId);
  
  // Get the occupied seats
  const { data: occupiedSeats, error } = await supabase
    .from('passengers')
    .select('id')
    .eq('bus_id', busId);
  
  if (error) {
    console.error('Error getting occupied seats:', error);
    throw error;
  }
  
  const occupiedSeatCount = occupiedSeats?.length || 0;
  return bus.max_passengers - occupiedSeatCount;
}

export async function getOccupiedSeats(busId: string) {
  const { data, error } = await supabase
    .from('passengers')
    .select('id, gender, bus_seat_number')
    .eq('bus_id', busId)
    .order('bus_seat_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching occupied seats:', error);
    throw error;
  }
  
  return data as { id: string; gender: 'L' | 'P'; bus_seat_number: number }[];
}

export async function fetchPassengerCounts() {
  const { data, error } = await supabase
    .from('passengers')
    .select('bus_id');

  if (error) {
    console.error('Error fetching passenger counts:', error);
    throw error;
  }

  // Count passengers per bus
  const counts: Record<string, number> = {};
  data.forEach(({ bus_id }) => {
    if (bus_id) {
      counts[bus_id] = (counts[bus_id] || 0) + 1;
    }
  });

  return counts;
}

// Subscribe to real-time updates
export function subscribeToUpdates(
  table: 'buses' | 'passengers',
  callback: (payload: any) => void
) {
  return supabase
    .channel(`${table}-channel`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
}

export async function generatePassengerExcel() {
  const passengers = await fetchPassengers();

  // Group passengers by bus
  const buses = {};
  passengers.forEach(passenger => {
    if (!passenger.bus) return;
    const sheetName = `${passenger.bus.destination} ${passenger.bus.bus_number}`;
    if (!buses[sheetName]) {
      buses[sheetName] = [];
    }
    buses[sheetName].push(passenger);
  });

  // Sort sheet names alphabetically
  const sortedBusKeys = Object.keys(buses).sort();

  const workbook = new ExcelJS.Workbook();
  const overviewSheet = workbook.addWorksheet("Overview");

  overviewSheet.columns = [
    { header: 'Bus', key: 'bus_name', width: 30 },
    { header: 'Total Penumpang', key: 'passenger_count', width: 20 },
    { header: 'Total Umum', key: 'total_umum', width: 20 },
    { header: 'Total Pondok', key: 'total_pondok', width: 20 },
    { header: 'Total Jumlah Makan Pondok', key: 'total_makan_pondok', width: 20 },
    { header: 'Total Jumlah Makan Umum', key: 'meal_count', width: 20 },
    { header: 'Total Pembayaran Uang Makan Umum', key: 'meal_payment', width: 20 },
    { header: 'Total Tiket (Umum + Pondok)', key: 'fare_per_passenger', width: 20 },
    { header: 'Total Pembayaran (Umum + Pondok)', key: 'total_payment', width: 20 },
    { header: 'Total Firma', key: 'total_firma', width: 20 },
    { header: 'Total Mbahman', key: 'total_mbahman', width: 20 },
  ];

  sortedBusKeys.forEach(sheetName => {
    const passengers = buses[sheetName];
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: 'Nomor', key: 'bus_seat_number', width: 10 },
      { header: 'Nama', key: 'name', width: 20 },
      { header: 'L/P', key: 'gender', width: 10 },
      { header: 'Telepon', key: 'phone', width: 10 },
      { header: 'Alamat', key: 'address', width: 30 },
      { header: 'Destination', key: 'destination', width: 20 },
      { header: 'Klp', key: 'group_pondok', width: 15 },
      { header: 'Dapur', key: 'dapur', width: 15 },
      { header: 'Jumlah Makan', key: 'meal_count', width: 10 },
      { header: 'Uang Makan', key: 'meal_payment', width: 15 },
      { header: 'Uang Tiket', key: 'fare_per_passenger', width: 15 },
      { header: 'Pembayaran', key: 'total_payment', width: 15 },
      { header: 'Tanggal Pemesanan', key: 'created_at', width: 20 }
    ];

    passengers.sort((a, b) => (a.bus_seat_number || 0) - (b.bus_seat_number || 0));

    let totalMealCount = 0, totalMealPayment = 0, totalFare = 0, totalPayment = 0;
    let totalUmum = 0, totalPondok = 0, totalFirma = 0, totalMbahman = 0;
    
    passengers.forEach(passenger => {
      const dapurKeywords = ['Guru', 'Pembina', 'Wustha', 'Ulya', 'Kelas', 'Firma', 'listrik', 'UKP', 'UB', "GP", "GB", "CBR", "Database", "Wustho", "Ketua", "Putri"];
      const dapur = dapurKeywords.some(keyword => passenger.group_pondok.toLowerCase().includes(keyword.toLowerCase())) ? 'Firma' : 'Mbahman';

      sheet.addRow({
        bus_seat_number: passenger.bus_seat_number,
        name: passenger.name,
        gender: passenger.gender,
        phone: passenger.phone,
        address: passenger.address,
        destination: passenger.destination,
        group_pondok: passenger.group_pondok,
        dapur: dapur,
        meal_count: passenger.meal_count,
        meal_payment: passenger.meal_payment,
        fare_per_passenger: passenger.bus.fare_per_passenger,
        total_payment: passenger.total_payment,
        created_at: new Date(passenger.created_at).toLocaleDateString()
      });

      totalMealCount += passenger.meal_count || 0;
      totalMealPayment += passenger.meal_payment || 0;
      totalFare += passenger.bus.fare_per_passenger || 0;
      totalPayment += passenger.total_payment || 0;

      if (passenger.group_pondok.startsWith('U-')) {
        totalUmum++;
      } else {
        totalPondok++;
      }

      if (dapur === 'Firma') {
        totalFirma++;
      } else {
        totalMbahman++;
      }
    });

    // Determine "Total Makan Pondok"
    let totalMakanPondok = 0;
    const destination = passengers[0]?.bus?.destination?.toLowerCase();
    if (['bandung', 'jakarta', 'cilacap', 'banyuwangi'].includes(destination)) {
      totalMakanPondok = totalPondok * 1;
    } else if (['lampung', 'palembang'].includes(destination)) {
      totalMakanPondok = totalPondok * 2;
    }

    // Add total row in each bus sheet
    sheet.addRow({
      name: 'Total',
      meal_count: totalMealCount,
      meal_payment: totalMealPayment,
      fare_per_passenger: totalFare,
      total_payment: totalPayment
    });

    // Add summary to overview sheet
    overviewSheet.addRow({
      bus_name: sheetName,
      passenger_count: passengers.length,
      total_umum: totalUmum,
      total_pondok: totalPondok,
      total_makan_pondok: totalMakanPondok,
      meal_count: totalMealCount,
      meal_payment: totalMealPayment,
      fare_per_passenger: totalFare,
      total_payment: totalPayment,
      total_firma: totalFirma,
      total_mbahman: totalMbahman,
    });
  });

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create a Blob and trigger download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Export Penumpang.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
