import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl = () => {
  const router = useRouter();

  //Set intId to -1 if the input id is bad
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const resArr = usePostQuery({
    pause: intId === -1, //pause the query for bad input id
    variables: { id: intId },
  });
  return [
    {
      intId,
      ...resArr[0],
    },
  ];
};
