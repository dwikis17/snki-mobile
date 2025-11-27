export interface StatisticsRequest {
    date_range: "daily" | "weekly" | "monthly" | "yearly";
    start_date: string;
    end_date: string;
    items_order_by: "quantity" | "total_price";
    sections: string[];
}

export interface OverviewItem {
    current: number;
    previous: number;
    change_rate: number;
    trend: "up" | "down" | "stable";
}

export interface OverviewData {
    invoice: OverviewItem;
    purchase_order: OverviewItem;
    purchase_request: OverviewItem;
    quotation: OverviewItem;
    [key: string]: OverviewItem;
}

export interface ChartItem {
    label: string;
    total: number;
    data: {
        [key: string]: number;
    };
}

export interface ChartsData {
    purchase_request: ChartItem[];
    quotation: ChartItem[];
    purchase_order: ChartItem[];
    invoice: ChartItem[];
    tracking: ChartItem[];
}

export interface ExpenseItem {
    current_total: number;
    previous_total: number;
    change_rate: number;
    trend: "up" | "down" | "stable";
    currency: string;
    description?: string;
}

export interface TotalExpenses {
    quotation: ExpenseItem;
    purchase_order: ExpenseItem;
    [key: string]: ExpenseItem;
}

export interface ProfitLossChartItem {
    label: string;
    total: number;
    data: {
        sum: number;
        count: number;
    }
}

export interface ProfitLossData {
    charts: ProfitLossChartItem[];
    total_expenses: ExpenseItem;
}

export interface TopItem {
    item_code: string;
    item_name: string;
    quantity: number;
    total_price: number;
    picture?: string;
}

export interface StatisticsResponse {
    success: boolean;
    message?: string;
    data: {
        overview: OverviewData;
        charts: ChartsData;
        total_expenses: TotalExpenses;
        profit_loss: ProfitLossData;
    };
}

export interface TopItemsResponse {
    success: boolean;
    message?: string;
    data: TopItem[];
}
