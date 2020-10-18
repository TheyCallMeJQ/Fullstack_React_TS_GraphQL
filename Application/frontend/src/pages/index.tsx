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
import {
  PostSnippetFragment,
  RegularUserFragment,
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const isOwner = (me: RegularUserFragment, post: PostSnippetFragment): boolean =>
  me.id === post.creator.id;

const Index = () => {
  console.group("index page");
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data: postsData, fetching: fetchingPosts }] = usePostsQuery({
    variables,
  });
  const [{ data: meData, fetching: fetchingMe }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  console.log("data", postsData);

  if (!postsData && !fetchingPosts)
    return <div>You got failed query for some reason</div>;

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
                  {!fetchingMe && meData?.me && isOwner(meData!.me, post) && (
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
                  )}
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
