import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

interface UpdatePostProps {}

const UpdatePost: React.FC<UpdatePostProps> = ({}) => {
  const router = useRouter();
  const [{ fetching, data, error }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();
  console.group("page update-post");
  // console.log(`Received id ${router.query.id}`);

  console.groupEnd();

  if (fetching)
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );

  if (!fetching && !data?.post)
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <Box>{error.message}</Box>
      </Layout>
    );

  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          title: data?.post?.title,
          text: data?.post?.text,
        }}
        // onSubmit={async (values, { setErrors }) => {
        onSubmit={async (values) => {
          //Errors are automatically handled by errorExchange on urql client.
          const { error } = await updatePost({
            id: data?.post?.id as any,
            ...values,
          });
          if (error) console.log(`Error in post/edit/${data?.post?.id}`);
          //Take user back to last page
          router.back();
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
              Save changes
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(UpdatePost);
