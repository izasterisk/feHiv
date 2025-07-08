const API_URL = 'http://localhost:8080/api';

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Username: username,
        Password: password
      })
    });

    const result = await response.json();

    // Kiểm tra response status
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
      }
      throw new Error(result.message || 'Đăng nhập thất bại');
    }

    // Kiểm tra business status từ API
    if (!result.status || result.statusCode !== 200) {
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
      }
      throw new Error('Đăng nhập thất bại');
    }

    // Lấy token và userDetails từ data
    const { token, userDetails } = result.data;
    if (!token || !userDetails) {
      console.error('Login response:', result);
      throw new Error('Dữ liệu đăng nhập không hợp lệ');
    }

    // Lưu token và userDetails
    localStorage.setItem('token', token);
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
    
    return { token, userDetails };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const forgotPassword = async (email, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/Auth/ForgotPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: newPassword
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
    }

    return await response.json();
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const userDetails = getUserDetails();
    if (!userDetails) {
      return null;
    }
    return userDetails;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    return null;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/User/Update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Cập nhật thông tin thất bại');
    }

    const result = await response.json();
    
    // Cập nhật userDetails trong localStorage
    if (result.data) {
      localStorage.setItem('userDetails', JSON.stringify(result.data));
    }

    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userDetails');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserDetails = () => {
  const userDetailsStr = localStorage.getItem('userDetails');
  return userDetailsStr ? JSON.parse(userDetailsStr) : null;
};

export const isAuthenticated = () => {
  const token = getToken();
  const userDetails = getUserDetails();
  return !!(token && userDetails);
};