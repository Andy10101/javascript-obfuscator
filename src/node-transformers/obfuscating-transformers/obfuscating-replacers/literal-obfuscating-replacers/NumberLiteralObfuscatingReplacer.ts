import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { IOptions } from '../../../../interfaces/options/IOptions';

import { AbstractObfuscatingReplacer } from '../AbstractObfuscatingReplacer';
import { Nodes } from '../../../../node/Nodes';
import { Utils } from '../../../../utils/Utils';

@injectable()
export class NumberLiteralObfuscatingReplacer extends AbstractObfuscatingReplacer {
    /**
     * @type {Map<string, string>}
     */
    private readonly numberLiteralCache: Map <number, string> = new Map();

    /**
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(options);
    }

    /**
     * @param {Literal} node
     * @returns {Node}
     */
    public replace (node: ESTree.Literal): ESTree.Node {
        const literalValue: number = <number>node.value;

        let rawValue: string;

        if (this.numberLiteralCache.has(literalValue)) {
            rawValue = <string>this.numberLiteralCache.get(literalValue);
        } else {
            if (!Utils.isCeilNumber(literalValue)) {
                rawValue = String(literalValue);
            } else {
                rawValue = `${Utils.hexadecimalPrefix}${Utils.decToHex(literalValue)}`;
            }

            this.numberLiteralCache.set(literalValue, rawValue);
        }

        return Nodes.getLiteralNode(literalValue, rawValue);
    }
}
