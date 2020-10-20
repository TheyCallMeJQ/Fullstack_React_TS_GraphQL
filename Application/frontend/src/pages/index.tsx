import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  console.group("index page");
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [
    { error: postsError, data: postsData, fetching: fetchingPosts },
  ] = usePostsQuery({
    variables,
  });

  console.log("data", postsData);

  if (postsError || (!postsData && !fetchingPosts))
    return (
      <div>
        <h1>Failed query</h1>
        <div>{postsError?.message}</div>
      </div>
    );

  // console.log("posts", postsData?.posts);

  console.groupEnd();

  return !postsData && fetchingPosts ? (
    <div>Loading...</div>
  ) : (
    <Layout>
      <Stack spacing={8}>
        {postsData?.posts.posts.map((post) =>
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
                  <EditDeletePostButtons
                    id={post.id}
                    creatorId={post.creator.id}
                  />
                </Flex>
              </Box>
            </Flex>
          )
        )}
      </Stack>
      {postsData && postsData.posts.hasMore && (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor:
                  postsData.posts.posts[postsData.posts.posts.length - 1]
                    .createdAt,
              })
            }
            isLoading={fetchingPosts}
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
