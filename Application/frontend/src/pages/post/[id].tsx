import { Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = ({}) => {
  const router = useRouter();

  //Set intId to -1 if the input id is bad
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  console.log("int id", intId);

  const [{ fetching, data, error }] = usePostQuery({
    pause: intId === -1, //pause the query for bad input id
    variables: { id: intId },
  });
  console.log("fetching", fetching);
  console.log("data", data);

  if (fetching)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  if (!data?.post) {
    <Layout>
      <div>Could not find post</div>
    </Layout>;
  }

  if (error) {
    console.log(error.message);

    return (
      <Layout>
        <Heading>{data?.post?.title}</Heading>
        <div>{error.message}</div>
      </Layout>
    );
  }

  return <Layout>{data?.post?.text}</Layout>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
