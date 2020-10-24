import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";

export const useIsAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();
  //Redirect user to login on page access without user credentials
  useEffect(() => {
    if (!data?.me && !loading) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, loading]);
};
