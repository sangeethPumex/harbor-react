import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('harbor_token') : null,
  role: typeof window !== 'undefined' ? localStorage.getItem('harbor_user_role') : null,
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
    setCredentials(state, action: PayloadAction<{ token: string; role?: string }>) {
      state.token = action.payload.token;
      state.role = action.payload.role || null;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('harbor_token', action.payload.token);
        localStorage.setItem('harbor_logged_in', 'true');
        if (action.payload.role) {
          localStorage.setItem('harbor_user_role', action.payload.role);
        }
      }
    },
    logout(state) {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('harbor_token');
        localStorage.removeItem('harbor_logged_in');
        localStorage.removeItem('harbor_user_role');
      }
    },
  },
});

export const { setToken, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
