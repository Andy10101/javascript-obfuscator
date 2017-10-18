import { injectable } from 'inversify';

import * as ESTree from 'estree';

import { IDeclarationIdentifiersDetector } from '../../../interfaces/analyzers/block-scope-analyzer/IDeclarationIdentifiersDetector';
import { NodeGuards } from '../../../node/NodeGuards';

@injectable()
export class VariableDeclarationIdentifiersDetector implements IDeclarationIdentifiersDetector {
    public detect (node: ESTree.Node): ESTree.Identifier[] {
        const declarationIdentifiers: ESTree.Identifier[] = [];

        if (NodeGuards.isVariableDeclaratorNode(node)) {
            declarationIdentifiers = BlockScopeAnalyzer.getPatternNodeIdentifiers(node.id);
        }

        return declarationIdentifiers;
    }
}
