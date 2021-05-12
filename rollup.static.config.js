import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import externals from 'rollup-plugin-node-externals';
import typescript from "typescript";

export default {
  input: "./node/render.ts",
  output: {
    file: "render.js",
    format: "cjs"
  },
  plugins: [
    ts({
      typescript,
      tsconfig: "tsconfig.static.json"
    }),
    externals(),
    nodeResolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    commonjs({ sourceMap: false })
  ]
};
