import { Box, Heading, Link as ChakraLink, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({ variables: { limit: 10 } });

  return fetching ? (
    <div>Loading...</div>
  ) : (
    <Layout>
      <NextLink href="/create-post">
        <ChakraLink>Create post</ChakraLink>
      </NextLink>
      <Stack>
        {data?.posts.map((post) => (
          <Box key={post.id} p={5} shadow="md" borderWidth="1px">
            <Heading fontSize="xl">{post.title}</Heading>
            <Text mt={4}>{post.textSnippet}</Text>
          </Box>
        ))}
      </Stack>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
