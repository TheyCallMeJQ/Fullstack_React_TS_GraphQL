import { Box, Button, Flex, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";

import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching: meFetching }] = useMeQuery({
    // Don't run this query on the server
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;
  // data is fetching
  if (meFetching) {
  }
  // user is not logged in
  else if (data?.me === null) {
    body = (
      <>
        <NextLink href="login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex>
        <Box mr={2}>{data?.me?.username}</Box>
        <Button
          isLoading={logoutFetching}
          variant="link"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
