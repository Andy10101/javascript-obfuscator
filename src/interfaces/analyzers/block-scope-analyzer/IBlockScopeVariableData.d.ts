import * as ESTree from 'estree';

import { IBlockScopeReference } from './IBlockScopeReference';

export interface IBlockScopeVariableData {
    name: ESTree.Identifier;
    definitions: ESTree.Identifier[];
    references: IBlockScopeReference[];
}
