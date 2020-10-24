import { Box, Heading } from "@chakra-ui/core";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

const Post = ({}) => {
  const [{ loading, data, error }] = useGetPostFromUrl();

  if (loading)
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

  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Box mb={4}>{data?.post?.text}</Box>
      <EditDeletePostButtons
        id={data?.post?.id as any}
        creatorId={data?.post?.creator.id as any}
      />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
