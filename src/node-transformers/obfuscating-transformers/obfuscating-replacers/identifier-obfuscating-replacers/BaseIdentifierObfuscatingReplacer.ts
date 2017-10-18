import { injectable, inject } from 'inversify';
import { ServiceIdentifiers } from '../../../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { IIdentifierObfuscatingReplacer } from '../../../../interfaces/node-transformers/obfuscating-transformers/obfuscating-replacers/IIdentifierObfuscatingReplacer';
import { IOptions } from '../../../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../../../interfaces/utils/IRandomGenerator';

import { AbstractObfuscatingReplacer } from '../AbstractObfuscatingReplacer';
import { Nodes } from '../../../../node/Nodes';

@injectable()
export class BaseIdentifierObfuscatingReplacer extends AbstractObfuscatingReplacer implements IIdentifierObfuscatingReplacer {
    /**
     * @type {Map<string, string>}
     */
    protected readonly namesMap: Map<string, string> = new Map();

    /**
     * @type {IRandomGenerator}
     */
    protected readonly randomGenerator: IRandomGenerator;

    /**
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(options);

        this.randomGenerator = randomGenerator;
    }

    /**
     * @param {Identifier} node
     * @param {number} nodeIdentifier
     * @returns {Identifier}
     */
    public replace (node: ESTree.Identifier, nodeIdentifier: number): ESTree.Identifier {
        const identifierName: string = node.name;
        const mapKey: string = `${identifierName}-${String(nodeIdentifier)}`;

        const newIdentifierName: string = this.namesMap.has(mapKey)
            ? <string>this.namesMap.get(mapKey)
            : identifierName;

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

        if (this.isReservedName(identifierName)) {
            return;
        }

        this.namesMap.set(
            `${identifierName}-${String(nodeIdentifier)}`,
            this.randomGenerator.getRandomVariableName(6)
        );
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    protected isReservedName (name: string): boolean {
        return this.options.reservedNames
            .some((reservedName: string) => {
                return new RegExp(reservedName, 'g').exec(name) !== null;
            });
    }
}
