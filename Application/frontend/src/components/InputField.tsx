import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/core";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  isTextArea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  isTextArea,
  ...props
}) => {
  //If we pass in isTextArea prop true, then make our input a Textarea instead of an Input
  let Component = Input;
  if (isTextArea) {
    Component = Textarea;
  }
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Component {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
