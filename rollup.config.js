import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

function createConfig(filename, useSvelte = false) {
    return {
        input: `src/${filename}.ts`,
        output: {
            format: 'iife',
            file: `public/build/${filename}.js`,
        },
        plugins: [
            useSvelte &&
            svelte({
                dev: !production,
                css: css => {
                    css.write(`${filename}.css`, false);
                },
                preprocess: sveltePreprocess(),
            }),

            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            commonjs(),
            typescript(),
            production && terser(),
        ],
        watch: {
            clearScreen: false,
        },
    };
}

export default [
    createConfig('devtools'),
    createConfig('background'),
    createConfig('content'),
    createConfig('panel', true),
    createConfig('codeView', true),
];
