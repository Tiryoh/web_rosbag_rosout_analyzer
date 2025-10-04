// Type declarations for compression libraries without official types

declare module 'seek-bzip' {
  export function decompress(data: Uint8Array): Uint8Array;
}

declare module 'lz4js' {
  function decompress(data: Uint8Array): Uint8Array;
  export default { decompress };
  export { decompress };
}
