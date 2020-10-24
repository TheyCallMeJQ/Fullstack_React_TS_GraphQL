import React from "react";
import { Formik, Form } from "formik";
import { Box, Button, Flex, Link as ChakraLink } from "@chakra-ui/core";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
// import { withUrqlClient } from "next-urql";
// import { createUrqlClient } from "../utils/createUrqlClient";
import { useRouter } from "next/router";

import NextLink from "next/link";
import { withApollo } from "../utils/withApollo";

interface registerProps {}

const Login: React.FC<registerProps> = ({}) => {
  const [login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          //return promise to end spinner on resolve
          const { data, errors } = await login({
            variables: values,
            update: (cache, { data }) => {
              //Update the me query
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.login.user,
                },
              });
              cache.evict({ fieldName: "posts" });
            },
          });
          // console.log("response", response);
          // console.log("errors", response.data?.login.errors);
          if (errors) {
            console.log("Something went wrong with the query");
          }

          if (data?.login.errors) {
            const map = toErrorMap(data?.login.errors);
            // console.log("error map", map);

            setErrors(map);
          } else if (data?.login.user) {
            //Redirect the user on successful registration
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Username or Email"
              placeholder="username or email"
              name="usernameOrEmail"
            />
            <Box mt={4}>
              <InputField
                label="Password"
                placeholder="password"
                name="password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <ChakraLink ml="auto">Forgot password</ChakraLink>
              </NextLink>
            </Flex>
            <Button
              mt={1}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
