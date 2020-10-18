import { Flex, IconButton } from "@chakra-ui/core";
import React from "react";
import { Post, PostSnippetFragment } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton aria-label="Updoot post" icon="chevron-up" />
      {post.points}
      <IconButton aria-label="Downdoot post" icon="chevron-down" />
    </Flex>
  );
};
