import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { IOptions } from '../../../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../../../interfaces/utils/IRandomGenerator';

import { BaseIdentifierObfuscatingReplacer } from './BaseIdentifierObfuscatingReplacer';
import { Nodes } from '../../../../node/Nodes';

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
     * @type {Map<ESTree.Node, string>}
     */
    // private scopeNodeNamesMap: Map <ESTree.Node, string> = new Map();

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
    private static getNewName (name: string): string {
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
     * @param {string} nodeValue
     * @param {number} nodeIdentifier
     * @returns {Identifier}
     */
    public replace (nodeValue: string, nodeIdentifier: number): ESTree.Identifier {
        const mapKey: string = `${nodeValue}-${String(nodeIdentifier)}`;

        if (this.namesMap.has(mapKey)) {
            nodeValue = <string>this.namesMap.get(mapKey);

            const previousNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(
                /*<string>this.scopeNodeNamesMap.get(scopeNode) || */''
            );
            const currentNameWeight: number = MangleIdentifierObfuscatingReplacer.getNameWeight(nodeValue);

            if (currentNameWeight > previousNameWeight) {
                // this.scopeNodeNamesMap.set(scopeNode, nodeValue);
            }
        }

        return Nodes.getIdentifierNode(nodeValue);
    }

    /**
     * Store all `nodeIdentifier`'s as keys in given `namesMap` with random names as value.
     * Reserved names will be ignored.
     *
     * @param {string} nodeName
     * @param {number} nodeIdentifier
     */
    public storeNames (nodeName: string, nodeIdentifier: number): void {
        if (this.isReservedName(nodeName)) {
            return;
        }

        const mapKey: string = `${nodeName}-${String(nodeIdentifier)}`;
        const baseName: string = /*this.scopeNodeNamesMap.get(scopeNode) ||*/ MangleIdentifierObfuscatingReplacer.initNameCharacter;
        const newName: string = MangleIdentifierObfuscatingReplacer.getNewName(baseName);

        this.namesMap.set(mapKey, newName);
        // this.scopeNodeNamesMap.set(scopeNode, newName);
    }
}
