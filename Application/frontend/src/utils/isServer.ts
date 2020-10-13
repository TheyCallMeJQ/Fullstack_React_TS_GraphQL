/**
 * Return true if we're executing this code on the server (SSR).
 * */
export const isServer = () => typeof window === "undefined";
