'use strict';
import { NO_CUSTOM_NODES_PRESET } from '../../src/options/presets/NoCustomNodes';

(function () {
    const JavaScriptObfuscator: any = require('../../index');

    let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
        `   
        (function(){
            var foo = function (bar) {
                console.log(foo);
            }
        })();
        `,
        {
            ...NO_CUSTOM_NODES_PRESET,
            compact: false,
            mangle: true
        }
    ).getObfuscatedCode();

    console.log(obfuscatedCode);
    console.log(eval(obfuscatedCode));
})();
