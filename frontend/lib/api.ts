import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface PredictRequest {
    crop_type: string;
    temperature: number;
    humidity: number;
    transport_days: number;
    moisture_percent: number;
    storage_temp?: number;
}

export interface PredictResponse {
    risk_label: "Low" | "Medium" | "High";
    risk_score: number;
    risk_percent: number;
    probabilities: Record<string, number>;
    recommendation: {
        color: string;
        icon: string;
        message: string;
        actions: string[];
        estimated_shelf_life: string;
    };
    input_summary: Record<string, unknown>;
    timestamp: string;
}

export interface WeatherResponse {
    location: string;
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: string;
    description: string;
    icon: string;
    icon_url: string;
    agri_alerts: string[];
    is_mock: boolean;
    timestamp: string;
}

/** POST /predict — Spoilage risk prediction */
export async function predictSpoilage(data: PredictRequest): Promise<PredictResponse> {
    const res = await axios.post<PredictResponse>(`${API_BASE}/predict`, data, {
        timeout: 15000,
    });
    return res.data;
}

/** GET /weather — Current weather for a location */
export async function getWeather(
    params: { lat?: number; lon?: number; city?: string } = {}
): Promise<WeatherResponse> {
    const res = await axios.get<WeatherResponse>(`${API_BASE}/weather`, {
        params,
        timeout: 10000,
    });
    return res.data;
}

/** GET /health — Backend health check */
export async function checkHealth(): Promise<boolean> {
    try {
        const res = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
        return res.data?.status === "ok";
    } catch {
        return false;
    }
}

/** GET /crops — List supported crops */
export async function getSupportedCrops(): Promise<string[]> {
    try {
        const res = await axios.get<{ crops: string[] }>(`${API_BASE}/crops`);
        return res.data.crops;
    } catch {
        return ["Cashew", "Tomato", "Onion", "Potato", "Mango", "Banana", "Wheat", "Rice"];
    }
}
