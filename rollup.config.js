import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import path from "path";

const production = !process.env.ROLLUP_WATCH;
const inputDirectory = "src/html";
const outputDirectory = "dist/html";

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require("child_process").spawn(
                "npm",
                ["run", "start", "--", "--dev"],
                {
                    stdio: ["ignore", "inherit", "inherit"],
                    shell: true,
                }
            );

            process.on("SIGTERM", toExit);
            process.on("exit", toExit);
        },
    };
}

export default {
    input: `${inputDirectory}/main.ts`,
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: `${inputDirectory}bundle.js`,
    },
    plugins: [
        svelte({
            dev: !production,
            css: (css) => {
                css.write(`${inputDirectory}/bundle.css`);
            },
            preprocess: sveltePreprocess(),
        }),

        copy({
            targets: [
                {
                    src: `${inputDirectory}/public/**.*`,
                    dest: outputDirectory,
                },
            ],
        }),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs(),
        typescript({
            sourceMap: true,
            tsconfig: path.join(__dirname, "tsconfig.rollup.json"),
        }),

        !production && serve(),
        !production && livereload(outputDirectory),
        production && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
