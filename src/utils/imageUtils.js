export const getFullImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150?text=No+Image";
  
  // If the path already includes http or https, it's a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, construct the full URL using the API base URL
  const baseUrl = 'https://car-rental-backend-t062.onrender.com'; // This should match your API base URL
  
  // Fix the issue with /src/ in the path
  let formattedPath = path;
  if (path.includes('/src/uploads/')) {
    formattedPath = path.replace('/src/uploads/', '/uploads/');
  } else if (!path.startsWith('/')) {
    formattedPath = `/${path}`;
  }
  
  return `${baseUrl}${formattedPath}`;
};

// Enhanced driver image handling with specific path fixes
export const getDriverImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150?text=Driver";
  
  // If it's already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Extract the file name and create a direct path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    // If the file is a profile image, always use the direct path
    if (fileName.startsWith('profileImage-')) {
      return `http://localhost:4000/uploads/${fileName}`;
    }
    return path;
  }
  
  // Sometimes driver images come with different path patterns
  const baseUrl = 'http://localhost:4000';
  
  // Fix common path issues
  let formattedPath = path;
  
  // Fix for /src/ in path
  if (path.includes('/src/uploads/')) {
    formattedPath = path.replace('/src/uploads/', '/uploads/');
  } 
  // Fix for missing leading slash
  else if (!path.startsWith('/')) {
    formattedPath = `/${path}`;
  }
  
  // Always remove /drivers/ directory from path for profileImage files
  if (formattedPath.includes('profileImage-')) {
    const fileName = formattedPath.split('/').pop();
    formattedPath = `/uploads/${fileName}`;
  }
  
  console.log("Fixed driver image path:", {
    original: path,
    formatted: formattedPath,
    final: `${baseUrl}${formattedPath}`
  });
  
  return `${baseUrl}${formattedPath}`;
};

// Add a dedicated function for license images 
export const getLicenseImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x200?text=License";
  
  // If it's already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Extract the file name and create a direct path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    // If the file is a license image, always use the direct path
    if (fileName.startsWith('licenseImage-')) {
      return `http://localhost:4000/uploads/${fileName}`;
    }
    return path;
  }
  
  // Handle different path patterns
  const baseUrl = 'http://localhost:4000';
  
  // Fix common path issues
  let formattedPath = path;
  
  // Fix for /src/ in path
  if (path.includes('/src/uploads/')) {
    formattedPath = path.replace('/src/uploads/', '/uploads/');
  } 
  // Fix for missing leading slash
  else if (!path.startsWith('/')) {
    formattedPath = `/${path}`;
  }
  
  // Always remove /drivers/ directory from path for licenseImage files
  if (formattedPath.includes('licenseImage-')) {
    const fileName = formattedPath.split('/').pop();
    formattedPath = `/uploads/${fileName}`;
  }
  
  console.log("Fixed license image path:", {
    original: path,
    formatted: formattedPath,
    final: `${baseUrl}${formattedPath}`
  });
  
  return `${baseUrl}${formattedPath}`;
};
