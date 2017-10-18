import * as ESTree from 'estree';

import { IAnalyzer } from '../IAnalyzer';
import { IBlockScopeData } from './IBlockScopeData';

export interface IBlockScopeAnalyzer extends IAnalyzer {
    /**
     * @param {Node} node
     * @returns {IBlockScopeData[]}
     */
    analyze (node: ESTree.Node): IBlockScopeData[];
}
