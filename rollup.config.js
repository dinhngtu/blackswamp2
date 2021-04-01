import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import { terser } from "rollup-plugin-terser";
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
    nodeResolve({
      browser: true
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    commonjs({ sourceMap: false }),
    terser()
  ]
};
