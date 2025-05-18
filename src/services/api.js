import axios from 'axios';

const api = axios.create({
  baseURL: 'https://car-rental-backend-t062.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Keep track of if we're currently refreshing token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper to check if a URL is an admin route
const isAdminRouteUrl = (url) => {
  return url.includes('/admin') || url.includes('/dashboard');
};

// Helper to check if we're on an admin page based on window location
const isOnAdminPage = () => {
  return window.location.pathname.startsWith('/admin');
};

// Helper to determine which token to use for which endpoint
const selectTokenForEndpoint = (url, pathname) => {
  // Explicitly handle admin-specific paths
  if (url.startsWith('/admin')) {
    return 'adminToken';
  }
  
  // If we're on admin pages, use admin token by default
  if (pathname.startsWith('/admin')) {
    return 'adminToken';
  }
  
  // For dashboard endpoints
  if (url.startsWith('/dashboard')) {
    return 'adminToken';
  }
  
  // If not on admin page and not calling admin endpoint, use user token
  return 'token';
};

// Helper to log API requests in development
const logRequest = (config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
  }
  return config;
};

api.interceptors.request.use(
  (config) => {
    // Skip further processing if this request wants to bypass interceptors
    if (config._bypassInterceptor) {
      delete config._bypassInterceptor;
      return config;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    const originalUrl = config.url;
    const pathname = window.location.pathname;
    
    // Clear out any Authorization header first to avoid confusion
    delete config.headers.Authorization;
    
    // If headers already has Authorization, respect it and don't override
    if (config.headers.Authorization) {
      console.log("Using pre-set Authorization header");
      return logRequest(config);
    }
    
    // Determine which token to use based on endpoint and current page
    const tokenToUse = selectTokenForEndpoint(originalUrl, pathname);
    
    if (tokenToUse === 'adminToken' && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log("Using admin token for request:", originalUrl);
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
      console.log("Using user token for request:", originalUrl);
    } else {
      console.log("No auth token applied for request:", originalUrl);
    }
    
    return logRequest(config);
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip further processing if this request bypassed interceptors
    if (originalRequest._bypassInterceptor) {
      return Promise.reject(error);
    }
    
    console.warn(`API Error (${error.response?.status || 'Network'}) for ${originalRequest?.url}:`, 
      error.response?.data || error.message);
    
    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check which token we're using
      const isAdminRoute = isAdminRouteUrl(originalRequest.url) || isOnAdminPage();
      const tokenKey = isAdminRoute ? 'adminToken' : 'token';
      
      // Don't redirect instantly for token issues
      if (!isRefreshing) {
        isRefreshing = true;
        
        console.warn("Authentication issue detected with", tokenKey, 
          "Message:", error.response?.data?.message);
        
        // Only clear token if it's truly an auth issue AND it's an auth-specific endpoint
        if (error.response?.data?.message?.includes('Authentication failed') && 
            (originalRequest.url.includes('/check-auth'))) {
          
          localStorage.removeItem(tokenKey);
          console.warn(`Cleared ${tokenKey} due to auth failure`);
          
          // Only redirect for check-auth routes
          if (originalRequest.url.includes('/check-auth')) {
            const redirectPath = isAdminRoute ? '/admin/login' : '/auth/signin';
            console.warn(`Will redirect to ${redirectPath}`);
            if (window.location.pathname !== redirectPath) {
              // Use a timeout to prevent immediate redirects
              setTimeout(() => {
                window.location.href = redirectPath;
              }, 1000);
            }
          }
        }
        
        isRefreshing = false;
        processQueue(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Driver Management API Functions
const driverAPI = {
  // Get all drivers
  getAllDrivers: () => api.get('/admin/drivers'),
  
  // Get driver by ID with improved error handling and fallbacks
  getDriverById: (id) => {
    console.log(`Fetching driver details for ID: ${id}`);
    if (!id) {
      console.error('Invalid driver ID');
      return Promise.reject(new Error('Invalid driver ID'));
    }
    
    return api.get(`/admin/drivers/${id}`)
      .then(response => {
        if (!response.data || !response.data.success) {
          console.warn("API driver fetch returned unsuccessful response:", response.data);
        } else {
          console.log("Driver data successfully retrieved:", response.data.data?.name || 'No name');
        }
        return response;
      })
      .catch(error => {
        console.error("Error in getDriverById:", error?.response?.status || 'Network error');
        throw error;
      });
  },
  
  // Create new driver
  createDriver: (driverData) => {
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(driverData).forEach(key => {
      if (key !== 'profileImage' && key !== 'licenseImage') {
        formData.append(key, driverData[key]);
      }
    });
    
    // Add files if they exist
    if (driverData.profileImage) {
      formData.append('profileImage', driverData.profileImage);
    }
    
    if (driverData.licenseImage) {
      formData.append('licenseImage', driverData.licenseImage);
    }
    
    return api.post('/admin/drivers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update driver
  updateDriver: (id, driverData) => {
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(driverData).forEach(key => {
      if (key !== 'profileImage' && key !== 'licenseImage') {
        formData.append(key, driverData[key]);
      }
    });
    
    // Add files if they exist
    if (driverData.profileImage && typeof driverData.profileImage !== 'string') {
      formData.append('profileImage', driverData.profileImage);
    }
    
    if (driverData.licenseImage && typeof driverData.licenseImage !== 'string') {
      formData.append('licenseImage', driverData.licenseImage);
    }
    
    return api.put(`/admin/drivers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete driver
  deleteDriver: (id) => api.delete(`/admin/drivers/${id}`),
  
  // Get available drivers
  getAvailableDrivers: () => api.get('/admin/available-drivers'),
  
  // Assign driver to booking
  assignDriver: (driverId, bookingId) => api.post('/admin/drivers/assign', { driverId, bookingId }),
  
  // Complete driver assignment
  completeAssignment: (driverId) => api.post('/admin/drivers/complete-assignment', { driverId }),
};

// Add the driverAPI to the api object
api.drivers = driverAPI;

// Add payment-specific API functions
const paymentAPI = {
  // Initiate a Khalti payment
  initiateKhaltiPayment: (data) => {
    // Ensure we have the latest token for this request
    const token = localStorage.getItem('token');
    
    if (!token) {
      return Promise.reject(new Error('Authentication token not found. Please log in again.'));
    }
    
    console.log('Initiating Khalti payment with data:', {
      ...data,
      bookingId: data.bookingId
    });
    
    return api.post('/payment/khalti/initiate', data, {
      headers: {
        'Authorization': `Bearer ${token}` // Explicitly set token
      },
      timeout: 15000 // Add timeout to prevent hanging requests
    }).catch(error => {
      // Enhanced error handling for debugging payment issues
      console.error('Khalti initiation error details:', error.response?.data || error.message);
      
      // Throw a more descriptive error
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 500) {
        throw new Error('Payment gateway error. Please try again or choose a different payment method.');
      } else if (error.response?.status === 502) {
        throw new Error('Payment gateway configuration error. Please contact support.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error; // Rethrow original error if none of the above
    });
  },
  
  // Verify a Khalti payment
  verifyKhaltiPayment: (data) => {
    const token = localStorage.getItem('token');
    
    return api.post('/payment/khalti/verify', data, {
      headers: {
        'Authorization': `Bearer ${token}` // Explicitly set token
      }
    });
  },
  
  // Look up a Khalti payment status
  lookupKhaltiPayment: (pidx) => {
    const token = localStorage.getItem('token');
    
    return api.post('/payment/khalti/lookup', { pidx }, {
      headers: {
        'Authorization': `Bearer ${token}` // Explicitly set token
      }
    });
  }
};

// Add the paymentAPI to the api object
api.payment = paymentAPI;

export default api;