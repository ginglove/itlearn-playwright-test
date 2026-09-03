export const PAYMENT_DATA = [
    {
        button: 'Mock Thanh Cong (SUCCESS)',
        status: 'SUCCESS',
        expectedTitle: 'Đặt cọc xe thành công!',
        expectedStatus: 'Giao dịch đã xác nhận',
    },

    {
        button: 'Mock That Bai (FAILED)',
        status: 'FAILED',
        expectedTitle: 'Thanh toán thất bại!',
        expectedStatus: 'Giao dịch không thành công',
    },

    {
        button: 'Mock Het Han 15p (EXPIRED)',
        status: 'EXPIRED',
        expectedTitle: 'Đã hết thời gian giữ chỗ 15 phút!',
        expectedStatus: 'Phiên giữ chỗ hết hạn',
    },

    {
        button: 'Huy Giao Dich (CANCELLED)',
        status: 'CANCELLED',
        expectedTitle: '',
        expectedStatus: '',
    },
] as const;