// src/services/api-patch.js
import { Platform } from 'react-native';

class ApiServicePatch {
  constructor() {
    this.baseURL = 'http://10.0.0.183:3000';
    this.isOnline = true; // Force online mode
    console.log('🟢 API Service Patch: Forcing online mode');
  }

  async testConnection() {
    console.log('🟢 API Service Patch: Simulating successful connection');
    return { success: true, data: { status: 'connected' } };
  }

  // Add other methods as needed or import the real ApiService and patch it
}

export default new ApiServicePatch();
