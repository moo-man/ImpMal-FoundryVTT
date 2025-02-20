import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        files: ["**/*.js"],
        rules: {
            "no-unused-vars": "off",
            "no-undef": "warn",
            "indent": "error",
            "semi" : "error",
            "curly" : ["error", "all"],
            "@stylistic/js/brace-style" : ["error", "allman", {"allowSingleLine" : true}],
            "jsdoc/no-undefined-types" : "off"
        },
        plugins : {
            jsdoc,
            "@stylistic/js" : stylisticJs
        }
    },
];