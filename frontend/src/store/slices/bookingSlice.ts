import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  selectedBranch: any | null;
  selectedSport: any | null;
  selectedCourt: any | null;
  selectedDate: string;
  selectedSlot: { time: string; endTime: string } | null;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  completedBooking: any | null;
  preferredSportName: string | null;
}

const initialState: BookingState = {
  selectedBranch: null,
  selectedSport: null,
  selectedCourt: null,
  selectedDate: '',
  selectedSlot: null,
  customerDetails: { name: '', phone: '', email: '', notes: '' },
  completedBooking: null,
  preferredSportName: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBranch: (state, action: PayloadAction<any>) => {
      state.selectedBranch = action.payload;
      state.selectedSport = null;
      state.selectedCourt = null;
      state.selectedSlot = null;
    },
    setSport: (state, action: PayloadAction<any>) => {
      state.selectedSport = action.payload;
      state.selectedCourt = null;
      state.selectedSlot = null;
    },
    setCourt: (state, action: PayloadAction<any>) => {
      state.selectedCourt = action.payload;
      state.selectedSlot = null;
    },
    setDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.selectedSlot = null;
    },
    setSlot: (state, action: PayloadAction<{ time: string; endTime: string }>) => {
      state.selectedSlot = action.payload;
    },
    setCustomerDetails: (state, action: PayloadAction<Partial<BookingState['customerDetails']>>) => {
      state.customerDetails = { ...state.customerDetails, ...action.payload };
    },
    setCompletedBooking: (state, action: PayloadAction<any>) => {
      state.completedBooking = action.payload;
    },
    setPreferredSport: (state, action: PayloadAction<string | null>) => {
      state.preferredSportName = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const { setBranch, setSport, setCourt, setDate, setSlot, setCustomerDetails, setCompletedBooking, setPreferredSport, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
