import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
// import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
// import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();

  useIsAuth();
  const [createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        // onSubmit={async (values, { setErrors }) => {
        onSubmit={async (values) => {
          //Errors are automatically handled by errorExchange on urql client.
          const { errors } = await createPost({
            variables: { input: values },
            //evict the `posts` query
            update: (cache) => cache.evict({ fieldName: "posts" }),
          });
          if (!errors) {
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

export default withApollo({ ssr: false })(CreatePost);
