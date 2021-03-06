import React from "react";
// import { createUrqlClient } from "../utils/createUrqlClient";
// import { withUrqlClient } from "next-urql";
import { Box, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";

import { useForgotPasswordMutation } from "../generated/graphql";
import { useState } from "react";
import { withApollo } from "../utils/withApollo";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        // onSubmit={async (values, { setErrors }) => {
        onSubmit={async (values) => {
          //return promise to end spinner on resolve
          const response = await forgotPassword({
            variables: values,
          });
          console.log("response", response);

          setIsComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          isComplete ? (
            <Box>Email sent</Box>
          ) : (
            <Form>
              <InputField
                label="Email"
                placeholder="email"
                name="email"
                type="email"
              />
              <Button
                mt={1}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                Send reset password email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
