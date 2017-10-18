import * as ESTree from 'estree';

import { IAnalyzer } from '../IAnalyzer';
import { IScopeData } from './IScopeData';

export interface IScopeAnalyzer extends IAnalyzer {
    /**
     * @param {Program} astTree
     * @returns {IScopeData[]}
     */
    analyze (astTree: ESTree.Program): IScopeData[];
}
