import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { IBlockScopeAnalyzer } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeAnalyzer';
import { IBlockScopeData } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeData';

import { NodeGuards } from '../../node/NodeGuards';
import { NodeUtils } from '../../node/NodeUtils';

@injectable()
export class BlockScopeAnalyzer implements IBlockScopeAnalyzer {
    /**
     * @param {Program} astTree
     * @returns {IBlockScopeData[]}
     */
    public analyze (astTree: ESTree.Program): IBlockScopeData[] {
        const scopesData: IBlockScopeData[] = [];
        const mainScope: ESTree.Node = NodeUtils.getBlockScopesOfNode(astTree)[0];

        estraverse.traverse(mainScope, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): any => {
                if (NodeUtils.nodesWithBlockScope.includes(node.type)) {

                }
            }
        });

        return scopesData;
    }

    private buildScopeData(sc)
}
