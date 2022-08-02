import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "typescript";

export default {
  input: "./renderer/DynamicRenderer.tsx",
  output: {
    file: "public/js/dynamic.js",
    format: "iife"
  },
  plugins: [
    ts({
      typescript,
      tsconfig: "tsconfig.dynamic.json"
    }),
    nodeResolve({ browser: true }),
    commonjs({ sourceMap: false }),
  ]
};
