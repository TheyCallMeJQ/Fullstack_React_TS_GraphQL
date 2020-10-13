import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useRouter } from "next/router";

interface registerProps {}

const Login: React.FC<registerProps> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          //return promise to end spinner on resolve
          const response = await login(values);
          // console.log("response", response);
          // console.log("errors", response.data?.login.errors);

          if (response.data?.login.errors) {
            const map = toErrorMap(response.data?.login.errors);
            // console.log("error map", map);

            setErrors(map);
          } else if (response.data?.login.user) {
            //Redirect the user on successful registration
            router.push("/");
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
            <Button
              mt={4}
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

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
