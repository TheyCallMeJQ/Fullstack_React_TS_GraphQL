import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
// import { useRouter } from "next/router";
import { isServer } from "../utils/isServer";
import { useApolloClient } from "@apollo/client";

export const NavBar: React.FC<{}> = ({}) => {
  // const router = useRouter();
  const apolloClient = useApolloClient();
  const { data, loading: meLoading } = useMeQuery({
    // Don't run this query on the server
    skip: isServer(),
  });
  const [logout, { loading: logoutLoading }] = useLogoutMutation();

  let body = null;
  // data is fetching
  if (meLoading) {
  }
  // user is not logged in
  else if (data?.me === null) {
    body = (
      <>
        <NextLink href="login">
          <ChakraLink mr={2}>Login</ChakraLink>
        </NextLink>
        <NextLink href="register">
          <ChakraLink>Register</ChakraLink>
        </NextLink>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={ChakraLink} mr={4}>
            Create post
          </Button>
        </NextLink>
        <Box mr={2}>{data?.me?.username}</Box>
        <Button
          isLoading={logoutLoading}
          variant="link"
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
            // router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <ChakraLink>
            <Heading>LiReddit</Heading>
          </ChakraLink>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
