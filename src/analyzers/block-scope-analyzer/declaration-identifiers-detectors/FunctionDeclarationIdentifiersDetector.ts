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
        if (this.declarationIdentifiersCache.has(node)) {
            return <ESTree.Identifier[]>this.declarationIdentifiersCache.get(node);
        }

        const declarationIdentifiers: ESTree.Identifier[] = NodeGuards.isFunctionDeclarationNode(node)
            ? [
                node.id,
                ...node.params.reduce((identifiers: ESTree.Identifier[], param: ESTree.Pattern) => [
                    ...identifiers,
                    ...AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(param)
                ], [])
            ]
            : [];

        this.declarationIdentifiersCache.set(node, declarationIdentifiers);

        return declarationIdentifiers;
    }
}
