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
        return NodeGuards.isVariableDeclaratorNode(node)
            ? AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(node.id)
            : [];
    }
}
