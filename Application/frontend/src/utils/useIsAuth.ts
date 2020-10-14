import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";

export const useIsAuth = () => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery();
  //Redirect user to login on page access without user credentials
  useEffect(() => {
    if (!data?.me && !fetching) {
      router.push("/login");
    }
  }, [data, fetching]);
};
