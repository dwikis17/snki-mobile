export function formatCurrency(num: number) {
    return 'Rp' + num.toLocaleString('id-ID', { minimumFractionDigits: 2 });
}

export function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function statusColor(status: string) {
    switch (status) {
        case 'approved': return '#E3F0FF';
        case 'pending': return '#FFF7D6';
        case 'declined': return '#FFE3E3';
        case 'rejected': return '#FFE3E3';
        case 'draft': return '#F4F6F8';
        default: return '#F4F6F8';
    }
}

export function statusTextColor(status: string) {
    switch (status) {
        case 'approved': return '#1976D2';
        case 'pending': return '#B08800';
        case 'declined': return '#D32F2F';
        case 'rejected': return '#D32F2F';
        case 'draft': return '#607D8B';
        default: return '#607D8B';
    }
}