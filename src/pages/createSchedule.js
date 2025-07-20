import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const CreateSchedule = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        workDay: 'Monday',
        startTime: '',
        endTime: ''
    });

    // Kiểm tra và lấy doctorId từ localStorage khi component mount
    React.useEffect(() => {
        const userDetails = localStorage.getItem('userDetails');
        if (!userDetails) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userDetails);
        if (!user.doctorId) {
            toast.error('Bạn không có quyền truy cập trang này');
            navigate('/');
            return;
        }
    }, [navigate]);

    const workDays = [
        { value: 'Monday', label: 'Thứ Hai' },
        { value: 'Tuesday', label: 'Thứ Ba' },
        { value: 'Wednesday', label: 'Thứ Tư' },
        { value: 'Thursday', label: 'Thứ Năm' },
        { value: 'Friday', label: 'Thứ Sáu' },
        { value: 'Saturday', label: 'Thứ Bảy' },
        { value: 'Sunday', label: 'Chủ Nhật' }
    ];

    // Tạo mảng các giờ làm việc từ 8:00 đến 18:00
    const timeOptions = Array.from({ length: 11 }, (_, index) => {
        const hour = index + 8;
        return {
            value: `${hour.toString().padStart(2, '0')}:00`,
            label: `${hour.toString().padStart(2, '0')}:00`
        };
    });

    const handleTimeChange = (value, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Nếu chọn giờ bắt đầu, tự động đặt giờ kết thúc sau giờ bắt đầu 4 tiếng
        if (field === 'startTime' && value) {
            const startHour = parseInt(value.split(':')[0]);
            const endHour = Math.min(17);
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;
            setFormData(prev => ({
                ...prev,
                endTime: endTime
            }));
        }

        // Kiểm tra nếu giờ kết thúc nhỏ hơn hoặc bằng giờ bắt đầu
        if (field === 'endTime' && formData.startTime) {
            const startHour = parseInt(formData.startTime.split(':')[0]);
            const endHour = parseInt(value.split(':')[0]);
            if (endHour <= startHour) {
                toast.error('Giờ kết thúc phải sau giờ bắt đầu');
                setFormData(prev => ({
                    ...prev,
                    [field]: ''
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra đã chọn đủ thời gian chưa
        if (!formData.startTime || !formData.endTime) {
            toast.error('Vui lòng chọn giờ bắt đầu và giờ kết thúc');
            return;
        }

        // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
        const startHour = parseInt(formData.startTime.split(':')[0]);
        const endHour = parseInt(formData.endTime.split(':')[0]);
        if (endHour <= startHour) {
            toast.error('Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const userDetails = localStorage.getItem('userDetails');

            if (!token || !userDetails) {
                throw new Error('Vui lòng đăng nhập để tạo lịch làm việc');
            }

            const user = JSON.parse(userDetails);
            if (!user.doctorId) {
                throw new Error('Không tìm thấy thông tin bác sĩ');
            }

            // Format data theo yêu cầu của API
            const requestData = {
                doctorId: Number(user.doctorId),
                workDay: formData.workDay,
                startTime: formData.startTime + ':00',
                endTime: formData.endTime + ':00'
            };

            console.log('Sending data:', requestData);

            const response = await fetch(`${API_URL}/DoctorSchedule/Create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const responseText = await response.text();
            console.log('Response text:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing response:', error);
                throw new Error('Phản hồi không hợp lệ từ máy chủ');
            }

            if (response.ok) {
                toast.success('Tạo lịch làm việc thành công');
                navigate('/schedule-manager');
            } else {
                // Xử lý các loại lỗi cụ thể từ server
                if (data.errors) {
                    if (data.errors.WorkDay) {
                        toast.error('Bác sĩ đã có lịch làm việc vào ngày này');
                        throw new Error('Bác sĩ đã có lịch làm việc vào ngày này');
                    }
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(data.message || 'Không thể tạo lịch làm việc');
            }
        } catch (err) {
            console.error('Error creating schedule:', err);
            setError(err.message);
            toast.error(err.message || 'Có lỗi xảy ra khi tạo lịch làm việc');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Thêm lịch làm việc mới</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Tạo lịch làm việc cho bác sĩ {user?.fullName}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="workDay" className="block text-sm font-medium text-gray-700">
                                Ngày làm việc
                            </label>
                            <select
                                id="workDay"
                                name="workDay"
                                value={formData.workDay}
                                onChange={(e) => setFormData(prev => ({ ...prev, workDay: e.target.value }))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                {workDays.map(day => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                Giờ bắt đầu
                            </label>
                            <select
                                id="startTime"
                                value={formData.startTime}
                                onChange={(e) => handleTimeChange(e.target.value, 'startTime')}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Chọn giờ bắt đầu</option>
                                {timeOptions.map(time => (
                                    <option key={time.value} value={time.value}>
                                        {time.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                Giờ kết thúc
                            </label>
                            <select
                                id="endTime"
                                value={formData.endTime}
                                onChange={(e) => handleTimeChange(e.target.value, 'endTime')}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Chọn giờ kết thúc</option>
                                {timeOptions
                                    .filter(time => {
                                        // Chỉ hiển thị các giờ sau giờ bắt đầu
                                        if (!formData.startTime) return true;
                                        const startHour = parseInt(formData.startTime.split(':')[0]);
                                        const timeHour = parseInt(time.value.split(':')[0]);
                                        return timeHour > startHour;
                                    })
                                    .map(time => (
                                        <option key={time.value} value={time.value}>
                                            {time.label}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/schedule-manager')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tạo...
                                    </div>
                                ) : (
                                    'Tạo lịch'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSchedule;
