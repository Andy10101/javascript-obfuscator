import * as ESTree from 'estree';

import { TNodeWithBlockStatement } from '../../../types/node/TNodeWithBlockStatement';

import { IBlockScopeVariableData } from './IBlockScopeVariableData';

export interface IBlockScopeReference {
    identifier: ESTree.Identifier;
    from: TNodeWithBlockStatement;
    resolved: IBlockScopeVariableData | null;
    init: boolean;
}
