import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  console.log("data", data);

  if (!data && !fetching)
    return <div>You got failed query for some reason</div>;

  return !data && fetching ? (
    <div>Loading...</div>
  ) : (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <ChakraLink ml="auto">Create post</ChakraLink>
        </NextLink>
      </Flex>
      <br />
      <Stack spacing={8}>
        {data?.posts.posts.map((post) => (
          <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
            <UpdootSection post={post} />
            <Box>
              <Heading fontSize="xl">{post.title}</Heading>
              <Text>posted by {post.creator.username}</Text>
            </Box>
          </Flex>
        ))}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
