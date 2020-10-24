import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { CSSReset, ThemeProvider } from "@chakra-ui/core";
import theme from "../theme";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  cache: new InMemoryCache(),
  credentials: "include",
});

function MyApp({ Component, pageProps }: any) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
