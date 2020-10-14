import { Box, Link as ChakraLink } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery();

  return fetching ? (
    <div>Loading...</div>
  ) : (
    <Layout>
      <NextLink href="/create-post">
        <ChakraLink>Create post</ChakraLink>
      </NextLink>
      <Box>
        {data?.posts.map((post) => (
          <Box key={post.id}>{post.title}</Box>
        ))}
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
