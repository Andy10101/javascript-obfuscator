import * as ESTree from 'estree';

export interface IBlockScopeBlockData {
    type: string;
    body: ESTree.Node[];
}
