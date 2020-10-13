import React from "react";
import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => (
  <>
    <NavBar />
    <h1>Hi!</h1>
  </>
);

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
