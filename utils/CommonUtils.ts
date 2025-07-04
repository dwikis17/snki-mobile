export const formatCurrency = (value: number) => {
    if (isNaN(value)) {
        return 0
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};