import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/authService';

const AppointmentsPage = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra role khi component mount
    const checkUserRole = async () => {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/User/GetUserInfo', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status && response.data.data.role !== 'Patient') {
          // Nếu không phải patient, chuyển hướng về trang chủ
          navigate('/');
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return `${timeString}:00`;
  };

  const fetchDoctorDetails = async (doctorId) => {
    const token = getToken();
    try {
      const response = await axios.get(`http://localhost:8080/api/Doctor/GetByID/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status) {
        const doctorDetails = response.data.data;
        setAvailableDoctors(prev => 
          prev.map(doctor => 
            doctor.doctorId === doctorId 
              ? { ...doctor, details: doctorDetails }
              : doctor
          )
        );
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedDoctor(null);

    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const formattedDate = formatDate(date);
      const formattedTime = formatTime(time);
      
      const response = await axios.get(`http://localhost:8080/api/Appointment/GetAvailableDoctors`, {
        params: {
          appointmentDate: formattedDate,
          appointmentTime: formattedTime
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status) {
        const doctors = response.data.data.availableDoctors;
        setAvailableDoctors(doctors);
        
        // Fetch details for each doctor
        doctors.forEach(doctor => {
          fetchDoctorDetails(doctor.doctorId);
        });

        if (doctors.length === 0) {
          setError('Không tìm thấy bác sĩ nào phù hợp với thời gian đã chọn');
        }
      } else {
        setError('Không tìm thấy bác sĩ nào phù hợp với thời gian đã chọn');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
        console.error('Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Đặt Lịch Khám Bệnh</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chọn thời gian phù hợp để gặp bác sĩ chuyên môn của chúng tôi
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-12">
          <form onSubmit={handleSearch} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ngày khám */}
              <div className="space-y-2">
                <label htmlFor="date" className="block text-lg font-medium text-gray-700">
                  Ngày khám
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

              {/* Giờ khám */}
              <div className="space-y-2">
                <label htmlFor="time" className="block text-lg font-medium text-gray-700">
                  Giờ khám
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="time"
                    value={time}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9:]*$/.test(value) && value.length <= 5) {
                        setTime(value);
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const [hours, minutes] = value.split(':').map(Number);
                        if (hours >= 8 && hours <= 18 && minutes >= 0 && minutes <= 59) {
                          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes ? minutes.toString().padStart(2, '0') : '00'}`;
                          setTime(formattedTime);
                        } else {
                          setTime('');
                          setError('Vui lòng nhập giờ từ 08:00 đến 18:00');
                        }
                      }
                    }}
                    placeholder="08:00"
                    pattern="([0-1][0-9]|2[0-3]):[0-5][0-9]"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Thời gian từ 08:00 - 18:00</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </div>
                ) : (
                  'Tìm bác sĩ'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor List */}
        {availableDoctors.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Danh sách bác sĩ có lịch trống</h2>
            <div className="grid gap-6">
              {availableDoctors.map((doctor) => (
                <div
                  key={doctor.doctorId}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    selectedDoctor === doctor.doctorId ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Thông tin bác sĩ */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {doctor.doctorName}
                        </h3>
                        {doctor.details && (
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="font-medium">{doctor.details.phoneNumber}</span>
                            </div>
                            <div className="flex items-start text-gray-600">
                              <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              <span className="font-medium">{doctor.details.bio}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Nút chọn */}
                      <button
                        className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform ${
                          selectedDoctor === doctor.doctorId
                            ? 'bg-green-600 text-white shadow-lg hover:bg-green-700'
                            : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
                        }`}
                        onClick={() => setSelectedDoctor(doctor.doctorId)}
                      >
                        {selectedDoctor === doctor.doctorId ? 'Đã chọn' : 'Chọn bác sĩ'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút tiếp tục */}
            {selectedDoctor && (
              <div className="mt-10 flex justify-center">
                <button
                  className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => {
                    // TODO: Implement appointment booking
                    console.log('Proceed with booking for doctor:', selectedDoctor);
                  }}
                >
                  Tiếp tục đặt lịch
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage; 