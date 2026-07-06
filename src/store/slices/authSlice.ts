import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('harbor_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('harbor_token') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('harbor_token', action.payload);
        localStorage.setItem('harbor_logged_in', 'true');
      }
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('harbor_token');
        localStorage.removeItem('harbor_logged_in');
      }
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
