import { Box, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";

import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          //Errors are automatically handled by errorExchange on urql client.
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField label="Title" placeholder="title" name="title" />
            <Box mt={4}>
              <InputField
                isTextArea={true}
                label="Text"
                placeholder="text"
                name="text"
              />
            </Box>
            <Button
              mt={1}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(CreatePost);
