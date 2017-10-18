import * as ESTree from 'estree';

export interface IObfuscatingReplacer <T = ESTree.Node> {
    /**
     * @param {Node} node
     * @param {number} nodeIdentifier
     * @returns {T}
     */
    replace (node: ESTree.Node, nodeIdentifier?: number): T;
}
