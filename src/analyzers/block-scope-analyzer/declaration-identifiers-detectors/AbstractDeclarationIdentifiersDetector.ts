import { injectable } from 'inversify';

import * as ESTree from 'estree';

import { IDeclarationIdentifiersDetector } from '../../../interfaces/analyzers/block-scope-analyzer/IDeclarationIdentifiersDetector';
import { NodeGuards } from '../../../node/NodeGuards';

@injectable()
export abstract class AbstractDeclarationIdentifiersDetector implements IDeclarationIdentifiersDetector {
    /**
     * @type {Map<ESTree.Node, ESTree.Identifier[]>}
     */
    protected declarationIdentifiersCache: Map <ESTree.Node, ESTree.Identifier[]> = new Map();

    /**
     * @param {Pattern} patternNode
     * @returns {Identifier[]}
     */
    protected static getPatternNodeIdentifiers (patternNode: ESTree.Pattern): ESTree.Identifier[] {
        if (NodeGuards.isIdentifierNode(patternNode)) {
            return [patternNode];
        }

        if (NodeGuards.isAssignmentPatternNode(patternNode)) {
            return AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(patternNode.left);
        }

        if (NodeGuards.isRestElementNode(patternNode) && NodeGuards.isIdentifierNode(patternNode.argument)) {
            return AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(patternNode.argument);
        }

        if (NodeGuards.isArrayPatternNode(patternNode)) {
            return patternNode.elements
                .reduce((identifiers: ESTree.Identifier[], element: ESTree.Pattern) => [
                    ...identifiers,
                    ...AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(element)
                ], []);
        }

        if (NodeGuards.isObjectPatternNode(patternNode)) {
            return patternNode.properties
                .reduce((identifiers: ESTree.Identifier[], property: ESTree.AssignmentProperty) => [
                    ...identifiers,
                    ...AbstractDeclarationIdentifiersDetector.getPatternNodeIdentifiers(property.value)
                ], []);
        }

        return [];
    }

    /**
     * @param {Node} node
     * @returns {Identifier[]}
     */
    public abstract detect (node: ESTree.Node): ESTree.Identifier[];
}
