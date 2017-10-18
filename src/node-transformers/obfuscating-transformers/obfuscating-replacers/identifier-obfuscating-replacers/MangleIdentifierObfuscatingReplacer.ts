import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../../../container/ServiceIdentifiers';

import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { IOptions } from '../../../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../../../interfaces/utils/IRandomGenerator';

import { BaseIdentifierObfuscatingReplacer } from './BaseIdentifierObfuscatingReplacer';
import { Nodes } from '../../../../node/Nodes';
import { NodeUtils } from '../../../../node/NodeUtils';
import { NodeGuards } from '../../../../node/NodeGuards';

@injectable()
export class MangleIdentifierObfuscatingReplacer extends BaseIdentifierObfuscatingReplacer {
    /**
     * @type {string}
     */
    private static initNameCharacter: string = '9';

    /**
     * @type {string[]}
     */
    private static NameSequence: string[] = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'.split('');

    /**
     * @type {Set<Identifier>}
     */
    private renamedIdentifiersSet: Set <ESTree.Identifier> = new Set();

    /**
     * @type {Map<ESTree.Node, string>}
     */
    private scopeNodeNamesMap: Map <ESTree.Node, string> = new Map();

    /**
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(randomGenerator, options);
    }

    private static getNameWeight (name: string): number {
        return name
            .split('')
            .reduce(
                (previousValue: number, currentValue: string) =>
                    previousValue += MangleIdentifierObfuscatingReplacer.NameSequence.indexOf(currentValue),
                0
            );
    }

    /**
     * @param {string} name
     * @returns {string}
     */
    private static generateNewName (name: string): string {
        const NameSequence: string[] = MangleIdentifierObfuscatingReplacer.NameSequence;
        const ZeroSequenceCache: string[] = [];

        const zeroSequence: any = (num: number): string => {
            let res: string = ZeroSequenceCache[num];

            if (res !== undefined) {
                return res;
            }

            res = '0'.repeat(num);
            ZeroSequenceCache[num] = res;

            return res;
        };

        let cur: number = name.length - 1;

        do {
            let ch: string, index: number;

            ch = name.charAt(cur);
            index = NameSequence.indexOf(ch);

            if (index !== (NameSequence.length - 1)) {
                return name.substring(0, cur) + NameSequence[index + 1] + zeroSequence(name.length - (cur + 1));
            }

            --cur;
        } while (cur >= 0);

        return `a${zeroSequence(name.length)}`;

    }

    /**
     * @param {Identifier} node
     * @param {number} nodeIdentifier
     * @returns {Identifier}
     */
    public replace (node: ESTree.Identifier, nodeIdentifier: number): ESTree.Identifier {
        const identifierName: string = node.name;
        const scopeNode: ESTree.Node = NodeUtils.getBlockScopesOfNode(node)[0];
        const mapKey: string = `${identifierName}-${String(nodeIdentifier)}`;

        let newIdentifierName: string;

        if (this.namesMap.has(mapKey)) {
            newIdentifierName = <string>this.namesMap.get(mapKey);

            const previousNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(
                <string>this.scopeNodeNamesMap.get(scopeNode) || ''
            );
            const currentNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(newIdentifierName);

            if (currentNameWeight >= previousNameWeight) {
                this.scopeNodeNamesMap.set(scopeNode, newIdentifierName);
            }

            this.renamedIdentifiersSet.add(node);
        } else {
            newIdentifierName = identifierName;
        }

        return Nodes.getIdentifierNode(newIdentifierName);
    }

    /**
     * Store all `nodeIdentifier`'s as keys in given `namesMap` with random names as value.
     * Reserved names will be ignored.
     *
     * @param {Identifier} node
     * @param {number} nodeIdentifier
     */
    public storeNames (node: ESTree.Identifier, nodeIdentifier: number): void {
        const identifierName: string = node.name;
        const scopeNode: ESTree.Node = NodeUtils.getBlockScopesOfNode(node)[0];

        if (this.isReservedName(identifierName) || this.renamedIdentifiersSet.has(node)) {
            return;
        }

        const mapKey: string = `${identifierName}-${String(nodeIdentifier)}`;
        const newName: string = this.getNewName(scopeNode, node);

        this.namesMap.set(mapKey, newName);
        this.scopeNodeNamesMap.set(scopeNode, newName);
    }

    /**
     * @param {Node} scopeNode
     * @param {Identifier} identifier
     * @returns {string}
     */
    private getNewName (scopeNode: ESTree.Node, identifier: ESTree.Identifier): string {
        const identifierName: string = identifier.name;

        let baseName: string = this.scopeNodeNamesMap.get(scopeNode) || MangleIdentifierObfuscatingReplacer.initNameCharacter;

        estraverse.traverse(scopeNode, {
            enter: (node: ESTree.Node): any => {
                if (NodeGuards.isIdentifierNode(node) && node !== identifier && node.name === identifierName) {
                    const referenceIdentifierScopeNode: ESTree.Node = NodeUtils.getBlockScopesOfNode(node)[0];
                    const correctedBaseName: string = <string>this.scopeNodeNamesMap.get(referenceIdentifierScopeNode) || MangleIdentifierObfuscatingReplacer.initNameCharacter;

                    const baseNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(baseName);
                    const correctedBaseNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(correctedBaseName);

                    if (correctedBaseNameWeight >= baseNameWeight) {
                        baseName = correctedBaseName;
                    }
                }
            }
        });

        return MangleIdentifierObfuscatingReplacer.generateNewName(baseName);
    }
}
