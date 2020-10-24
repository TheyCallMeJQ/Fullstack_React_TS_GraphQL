import { Box, IconButton, Link as ChakraLink } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

/**
 * @param id The post's id
 * @param creatorId The id of the User who is the creator of the post.
 */
interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData, loading: loadingMe } = useMeQuery();
  const [deletePost] = useDeletePostMutation();

  //return null if the current user is not authorized to make modifications to this post
  if (loadingMe || meData?.me === null || meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box ml="auto">
      <NextLink href={`/post/edit/id`} as={`/post/edit/${id}`}>
        <IconButton as={ChakraLink} icon="edit" aria-label="Edit post" mr={4} />
      </NextLink>
      <IconButton
        icon="delete"
        aria-label="Delete post"
        onClick={() =>
          deletePost({
            variables: { id },
            update: (cache) => cache.evict({ id: `Post:${id}` }),
          })
        }
      />
    </Box>
  );
};
