import type {
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
  const { data } = await api.get<CircleResponse[]>("/circles", { params });
  return data;
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
