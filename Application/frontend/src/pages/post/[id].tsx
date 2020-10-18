import { Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
  const [{ fetching, data, error }] = useGetPostFromUrl();
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
