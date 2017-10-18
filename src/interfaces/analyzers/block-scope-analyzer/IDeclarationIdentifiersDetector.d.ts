import * as ESTree from 'estree';

export interface IDeclarationIdentifiersDetector {
    detect (node: ESTree.Node): ESTree.Identifier[];
}
