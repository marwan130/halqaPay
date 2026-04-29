import api from "./axios";

export interface AdvanceSimulationResponse {
  cyclesProcessed: number;
  details: Array<{
    circleId: string;
    month: number;
    payoutRecipientSlot: number;
    amount: string;
  }>;
}

export async function advanceSimulation(): Promise<AdvanceSimulationResponse> {
  const { data } = await api.post<AdvanceSimulationResponse>(
    "/admin/simulate/advance"
  );
  return data;
}

export async function seedDemo(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/admin/simulate/seed");
  return data;
}
