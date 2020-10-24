import { Box, Button, Link as ChakraLink } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { withApollo } from "../../utils/withApollo";

const ChangePassword: NextPage<{}> = () => {
  const [tokenError, setTokenError] = useState("");
  const [changePassword] = useChangePasswordMutation();
  const router = useRouter();
  // console.log("tokenError", tokenError);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          //return promise to end spinner on resolve
          const response = await changePassword({
            variables: {
              ...values,
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
            },
            update: (cache, { data }) => {
              //Update the me query
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.changePassword.user,
                },
              });
            },
          });

          // console.log("response", response);

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data?.changePassword.errors);
            if ("token" in errorMap) {
              const errMsg = errorMap.token;
              setTokenError(errMsg);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            setTokenError("");
            //Redirect the user to home on successful password change
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                label="New password"
                placeholder="new password"
                name="newPassword"
                type="password"
              />
            </Box>
            {tokenError && (
              <Box>
                <Box style={{ color: "red" }}>{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <ChakraLink>Forget password again</ChakraLink>
                </NextLink>
              </Box>
            )}
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: true })(ChangePassword);
