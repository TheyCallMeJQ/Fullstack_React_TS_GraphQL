import {
  Box,
  Button,
  Flex,
  Heading,
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
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  const [, deletePost] = useDeletePostMutation();
  console.log("data", data);

  if (!data && !fetching)
    return <div>You got failed query for some reason</div>;

  return !data && fetching ? (
    <div>Loading...</div>
  ) : (
    <Layout>
      <Stack spacing={8}>
        {data?.posts.posts.map((post) =>
          !post ? null : (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={post} />
              <Box flex={1}>
                <NextLink href="/post/id" as={`/post/${post.id}`}>
                  <ChakraLink>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </ChakraLink>
                </NextLink>
                <Text>posted by {post.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>
                    {post.textSnippet}
                  </Text>
                  <Box ml="auto">
                    <NextLink
                      href={`/post/edit/id`}
                      as={`/post/edit/${post.id}`}
                    >
                      <IconButton
                        as={ChakraLink}
                        icon="edit"
                        aria-label="Edit post"
                        mr={4}
                      />
                    </NextLink>
                    <IconButton
                      icon="delete"
                      aria-label="Delete post"
                      onClick={() => deletePost({ id: post.id })}
                    />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          )
        )}
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
