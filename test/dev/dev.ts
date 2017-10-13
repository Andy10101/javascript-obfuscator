'use strict';
import { NO_CUSTOM_NODES_PRESET } from '../../src/options/presets/NoCustomNodes';

(function () {
    const JavaScriptObfuscator: any = require('../../index');

    let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
        `
        (function () {
            var CompilerConfig = (function () {
                function CompilerConfig(_a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.renderTypes, renderTypes = _c === void 0 ? new DefaultRenderTypes() : _c;
                }
                return CompilerConfig;
            }());
            var DefaultRenderTypes = (function () {
                function DefaultRenderTypes() {
                }
                return DefaultRenderTypes;
            }());
            
            console.log(new CompilerConfig());
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
