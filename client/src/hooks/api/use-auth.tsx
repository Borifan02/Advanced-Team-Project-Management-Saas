import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    // If the user is not logged in, `/user/current` returns 401.
    // Retrying just spams the server logs and delays UI fallback.
    retry: false,
  });
  return query;
};

export default useAuth;
