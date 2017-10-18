import { injectable } from 'inversify';

import * as ESTree from 'estree';

import { AbstractDeclarationIdentifiersDetector } from './AbstractDeclarationIdentifiersDetector';
import { NodeGuards } from '../../../node/NodeGuards';

@injectable()
export class VariableDeclarationIdentifiersDetector extends AbstractDeclarationIdentifiersDetector {
    /**
     * @param {Node} node
     * @returns {Identifier[]}
     */
    public detect (node: ESTree.Node): ESTree.Identifier[] {
        if (this.declarationIdentifiersCache.has(node)) {
            return <ESTree.Identifier[]>this.declarationIdentifiersCache.get(node);
        }

        const declarationIdentifiers: ESTree.Identifier[] = NodeGuards.isVariableDeclaratorNode(node)
            ? AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(node.id)
            : [];

        this.declarationIdentifiersCache.set(node, declarationIdentifiers);

        return declarationIdentifiers;
    }
}
