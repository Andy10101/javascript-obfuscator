import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { TDeclarationIdentifiersDetectorFactory } from '../../types/analyzers/block-scope-analyzer/TDeclarationIdentifiersDetectorFactory';
import { TNodeWithBlockStatement } from '../../types/node/TNodeWithBlockStatement';

import { IBlockScopeAnalyzer } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeAnalyzer';
import { IBlockScopeData } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeData';
import { IBlockScopeReference } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeReference';
import { IBlockScopeVariableData } from '../../interfaces/analyzers/block-scope-analyzer/IBlockScopeVariableData';

import { NodeGuards } from '../../node/NodeGuards';
import { NodeUtils } from '../../node/NodeUtils';
import { DeclarationIdentifiersDetector } from '../../enums/analyzers/declaration-identifiers-detectors/DeclarationIdentifiersDetector';
import { IDeclarationIdentifiersDetector } from '../../interfaces/analyzers/block-scope-analyzer/IDeclarationIdentifiersDetector';

@injectable()
export class BlockScopeAnalyzer implements IBlockScopeAnalyzer {
    /**
     * @type {DeclarationIdentifiersDetector[]}
     */
    private readonly declarationIdentifiersDetectors: DeclarationIdentifiersDetector[] = [
        DeclarationIdentifiersDetector.FunctionDeclarationIdentifiersDetector,
        DeclarationIdentifiersDetector.FunctionExpressionDeclarationIdentifiersDetector,
        DeclarationIdentifiersDetector.VariableDeclarationIdentifiersDetector
    ];

    /**
     * @type {TDeclarationIdentifiersDetectorFactory}
     */
    private readonly declarationIdentifiersDetectorFactory: TDeclarationIdentifiersDetectorFactory;

    /**
     * @type {Map<Node, IBlockScopeVariableData>}
     */
    private readonly referencesStorage: Map <ESTree.Node, IBlockScopeVariableData> = new Map();

    /**
     * @param {TDeclarationIdentifiersDetectorFactory} declarationIdentifiersDetectorFactory
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__IDeclarationIdentifiersDetector) 
        declarationIdentifiersDetectorFactory: TDeclarationIdentifiersDetectorFactory
    ) {
        this.declarationIdentifiersDetectorFactory = declarationIdentifiersDetectorFactory;
    }

    /**
     * @param {Node} targetNode
     * @returns {IBlockScopeData[]}
     */
    public analyze (targetNode: ESTree.Node): IBlockScopeData[] {
        const blockScopesData: IBlockScopeData[] = [];
        const mainBlockScope: TNodeWithBlockStatement = NodeUtils.getBlockScopesOfNode(targetNode)[0];

        estraverse.traverse(mainBlockScope, {
            enter: (node: ESTree.Node): any => {
                if (!NodeGuards.isBlockScopeNode(node)) {
                    return;
                }

                const blockScopeData: IBlockScopeData = this.buildBlockScopeData(node);

                blockScopesData.push(blockScopeData);
            }
        });

        return blockScopesData;
    }

    /**
     * @param {TNodeWithBlockStatement} blockScopeNode
     * @returns {IBlockScopeData}
     */
    private buildBlockScopeData (blockScopeNode: TNodeWithBlockStatement): IBlockScopeData {
        const variables: IBlockScopeVariableData[] = [];
        const references: IBlockScopeReference[] = [];

        estraverse.traverse(blockScopeNode, {
            enter: (node: ESTree.Node): any => {
                // we should skip all nodes in inner block scopes while collecting `variables` data
                if (NodeGuards.isBlockScopeNode(node) && node !== blockScopeNode) {
                    return estraverse.VisitorOption.Skip;
                }

                const declarationIdentifiers: ESTree.Identifier[] = this.getDeclarationIdentifiers(node);

                if (!declarationIdentifiers.length) {
                    return;
                }

                declarationIdentifiers.forEach((declarationIdentifier: ESTree.Identifier) => {
                    const blockScopeVariableData: IBlockScopeVariableData = this.buildBlockScopeVariableData(
                        declarationIdentifier,
                        declarationIdentifiers,
                        blockScopeNode
                    );

                    variables.push(blockScopeVariableData);
                });
            }
        });

        const variableNameNodes: ESTree.Identifier[] = variables.map((variable: IBlockScopeVariableData) => variable.name);

        estraverse.traverse(blockScopeNode, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): any => {
                if (NodeGuards.isBlockScopeNode(node) && node !== blockScopeNode) {
                    return estraverse.VisitorOption.Skip;
                }

                if (
                    parentNode &&
                    NodeGuards.isReplaceableIdentifierNode(node, parentNode) &&
                    !variableNameNodes.includes(node)
                ) {
                    references.push({
                        identifier: node,
                        from: blockScopeNode,
                        resolved: this.referencesStorage.get(node) || null,
                        init: false
                    });
                }

                return;
            }
        });

        return { blockScope: blockScopeNode, variables, references };
    }

    /**
     * @param {Identifier} targetIdentifier
     * @param {Identifier[]} declarationIdentifiers
     * @param {TNodeWithBlockStatement} blockScope
     * @returns {IBlockScopeVariableData}
     */
    private buildBlockScopeVariableData (
        targetIdentifier: ESTree.Identifier,
        declarationIdentifiers: ESTree.Identifier[],
        blockScope: TNodeWithBlockStatement
    ): IBlockScopeVariableData {
        const name: ESTree.Identifier = targetIdentifier;
        const definitions: ESTree.Identifier[] = declarationIdentifiers
            .reduce((definitionIdentifiers: ESTree.Identifier[], identifier: ESTree.Identifier) => {
                return identifier.name === targetIdentifier.name
                    ? [...definitionIdentifiers, identifier]
                    : definitionIdentifiers;
            }, []);
        const references: IBlockScopeReference[] = [];
        const variableData: IBlockScopeVariableData = { name, definitions, references };

        estraverse.traverse(blockScope, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node | null): any => {
                if (
                    parentNode &&
                    NodeGuards.isReplaceableIdentifierNode(node, parentNode) &&
                    node.name === targetIdentifier.name
                ) {
                    this.referencesStorage.set(node, variableData);
                    references.push({
                        identifier: node,
                        from: blockScope,
                        resolved: variableData,
                        init: false
                    });
                }

                return;
            }
        });

        return variableData;
    }

    /**
     * @param {Node} node
     * @returns {Identifier[]}
     */
    private getDeclarationIdentifiers (node: ESTree.Node): ESTree.Identifier[] {
        return this.declarationIdentifiersDetectors
            .reduce((identifiers: ESTree.Identifier[], detectorName: DeclarationIdentifiersDetector) => {
                const declarationIdentifiersDetector: IDeclarationIdentifiersDetector = this.declarationIdentifiersDetectorFactory(
                    detectorName
                );

                return [...identifiers, ...declarationIdentifiersDetector.detect(node)];
            }, []);
    }
}
