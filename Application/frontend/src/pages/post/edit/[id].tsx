import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { createUrqlClient } from "../../../utils/createUrqlClient";

interface UpdatePostProps {}

const UpdatePost: React.FC<UpdatePostProps> = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  console.group("page update-post");
  console.log(`Received id ${router.query.id}`);
  console.groupEnd();

  return (
    <div>
      <h1>Hi!</h1>
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(UpdatePost);
