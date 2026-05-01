import { useQuery } from "@tanstack/react-query";
import type { ListCirclesParams } from "../api/circles";
import * as circlesApi from "../api/circles";

export function useCirclesList(params: ListCirclesParams) {
  return useQuery({
    queryKey: ["circles", params],
    queryFn: () => circlesApi.fetchCircles(params)
  });
}
