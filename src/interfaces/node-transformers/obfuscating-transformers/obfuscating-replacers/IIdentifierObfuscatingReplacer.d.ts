import * as ESTree from 'estree';

import { IObfuscatingReplacer } from './IObfuscatingReplacer';

export interface IIdentifierObfuscatingReplacer extends IObfuscatingReplacer <ESTree.Identifier> {
    /**
     * @param {Identifier} node
     * @param {number} nodeIdentifier
     */
    storeNames (node: ESTree.Identifier, nodeIdentifier: number): void;
}
