import ts from "@rollup/plugin-typescript";
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
    externals()
  ]
};
