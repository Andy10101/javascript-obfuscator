import { injectable } from 'inversify';

import * as ESTree from 'estree';

import { AbstractDeclarationIdentifiersDetector } from './AbstractDeclarationIdentifiersDetector';
import { NodeGuards } from '../../../node/NodeGuards';

@injectable()
export class FunctionDeclarationIdentifiersDetector extends AbstractDeclarationIdentifiersDetector {
    /**
     * @param {Node} node
     * @returns {Identifier[]}
     */
    public detect (node: ESTree.Node): ESTree.Identifier[] {
        return NodeGuards.isFunctionDeclarationNode(node)
            ? [
                node.id,
                ...node.params.reduce((identifiers: ESTree.Identifier[], param: ESTree.Pattern) => [
                    ...identifiers,
                    ...AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(param)
                ], [])
            ]
            : [];
    }
}
