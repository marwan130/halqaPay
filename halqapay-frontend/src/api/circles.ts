import type {
  CircleDetailResponse,
  CircleJoinOrValidateResponse,
  CircleResponse,
  CirclesListResponse,
  CreateCirclePayload,
  ValidateCircleBody
} from "../types";
import api from "./axios";

export interface ListCirclesParams {
  status?: string;
  currency?: string;
  minValue?: number;
  maxValue?: number;
}

export async function fetchCircles(
  params?: ListCirclesParams
): Promise<CircleResponse[]> {
  const { data } = await api.get<{ circles: CircleResponse[] } | CircleResponse[]>(
    "/circles",
    { params }
  );
  // Backend wraps response: { circles: [...] }
  if (Array.isArray(data)) return data;
  return (data as { circles: CircleResponse[] }).circles ?? [];
}

export async function fetchCircle(id: string): Promise<CircleResponse> {
  const { data } = await api.get<CircleResponse>(`/circles/${id}`);
  return data;
}

export async function createCircle(
  payload: CreateCirclePayload
): Promise<CircleResponse> {
  const { data } = await api.post<CircleResponse>("/circles", payload);
  return data;
}

export async function validateCircle(
  circleId: string,
  body: ValidateCircleBody
): Promise<CircleJoinOrValidateResponse> {
  const { data } = await api.post<CircleJoinOrValidateResponse>(
    `/circles/${circleId}/validate`,
    body
  );
  return data;
}

export async function joinCircle(
  circleId: string
): Promise<CircleJoinOrValidateResponse> {
  const { data } = await api.post<CircleJoinOrValidateResponse>(
    `/circles/${circleId}/join`
  );
  return data;
}

export async function leaveCircle(circleId: string): Promise<void> {
  await api.delete(`/circles/${circleId}/leave`);
}

export async function joinByCode(code: string): Promise<CircleJoinOrValidateResponse> {
  const { data } = await api.post<CircleJoinOrValidateResponse>("/circles/join-by-code", {
    code
  });
  return data;
}

export async function getCircleDetail(circleId: string): Promise<CircleDetailResponse> {
  const { data } = await api.get<CircleDetailResponse>(`/circles/${circleId}/detail`);
  return data;
}

export async function contributeToCircle(circleId: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/circles/${circleId}/contribute`);
  return data;
}
