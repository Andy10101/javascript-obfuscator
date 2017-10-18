import { TNodeWithBlockStatement } from '../../../types/node/TNodeWithBlockStatement';

import { IBlockScopeReference } from './IBlockScopeReference';
import { IBlockScopeVariableData } from './IBlockScopeVariableData';

export interface IBlockScopeData {
    blockScope: TNodeWithBlockStatement;
    variables: IBlockScopeVariableData[];
    references: IBlockScopeReference[];
}
