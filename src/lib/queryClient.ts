// money-tracker-fe/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // data dianggap fresh selama 5 menit
      retry: 1, // retry 1x kalau request gagal
      refetchOnWindowFocus: false, // handle refetch tiap kali tab di-focus
    },
  },
});

export default queryClient;
