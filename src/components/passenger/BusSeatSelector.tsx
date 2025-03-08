const BusSeatSelector = ({ occupiedSeats = [], onSeatSelect, selectedSeat = null, disabled = false }) => {
  // Compact layout with the same structure
  const seatLayout = [
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, 22, null, 23, 24],
    [25, 26, null, 27, 28],
    [29, 30, null, 31, 32],
    [33, 34, null, 35, 36],
    [37, 38, null, 39, 40],
    [41, 42, null, 43, 44],
    [45, 46, 47, 48, 49, 50]
  ];

  const isSeatOccupied = (seatNumber) => occupiedSeats.find(seat => seat.bus_seat_number === seatNumber);
  
  const handleSeatClick = (seatNumber) => {
    if (disabled || isSeatOccupied(seatNumber)) return;
    onSeatSelect(seatNumber);
  };
  
  const getSeatColorClass = (seatNumber) => {
    const occupied = isSeatOccupied(seatNumber);
    if (occupied) return occupied.gender === 'L' ? 'bg-red-500 text-white cursor-not-allowed' : 'bg-blue-500 text-white cursor-not-allowed';
    return selectedSeat === seatNumber ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100';
  };

  return (
    <div className="w-full max-w-lg mx-auto p-2">
      <div className="flex flex-col space-y-1">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map((seatNumber, colIndex) => (
              seatNumber ? (
                <button
                  key={colIndex}
                  type="button" // Explicitly set button type to prevent form submission
                  className={`h-8 w-10 border border-gray-300 rounded flex items-center justify-center text-xs font-medium ${getSeatColorClass(seatNumber)}`}
                  onClick={() => handleSeatClick(seatNumber)}
                  disabled={isSeatOccupied(seatNumber) || disabled}
                >
                  {seatNumber}
                </button>
              ) : (
                <div key={colIndex} className="h-8 w-10"></div>
              )
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex items-center justify-center space-x-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-1"></div>
          <span>Tersedia</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>Dipilih</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>L</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>P</span>
        </div>
      </div>
    </div>
  );
};

export default BusSeatSelector;