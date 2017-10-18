import { InversifyContainerFacade } from '../../InversifyContainerFacade';
import { ContainerModule, interfaces } from 'inversify';
import { ServiceIdentifiers } from '../../ServiceIdentifiers';

import { IBlockScopeAnalyzer } from '../../../interfaces/analyzers/block-scope-analyzer/IBlockScopeAnalyzer';
import { ICalleeDataExtractor } from '../../../interfaces/analyzers/stack-trace-analyzer/ICalleeDataExtractor';
import { IDeclarationIdentifiersDetector } from '../../../interfaces/analyzers/block-scope-analyzer/IDeclarationIdentifiersDetector';
import { IStackTraceAnalyzer } from '../../../interfaces/analyzers/stack-trace-analyzer/IStackTraceAnalyzer';

import { CalleeDataExtractor } from '../../../enums/analyzers/stack-trace-analyzer/CalleeDataExtractor';
import { DeclarationIdentifiersDetector } from '../../../enums/analyzers/declaration-identifiers-detectors/DeclarationIdentifiersDetector';

import { BlockScopeAnalyzer } from '../../../analyzers/block-scope-analyzer/BlockScopeAnalyzer';
import { FunctionDeclarationCalleeDataExtractor } from '../../../analyzers/stack-trace-analyzer/callee-data-extractors/FunctionDeclarationCalleeDataExtractor';
import { FunctionDeclarationIdentifiersDetector } from '../../../analyzers/block-scope-analyzer/declaration-identifiers-detectors/FunctionDeclarationIdentifiersDetector';
import { FunctionExpressionCalleeDataExtractor } from '../../../analyzers/stack-trace-analyzer/callee-data-extractors/FunctionExpressionCalleeDataExtractor';
import { FunctionExpressionDeclarationIdentifiersDetector } from '../../../analyzers/block-scope-analyzer/declaration-identifiers-detectors/FunctionExpressionDeclarationIdentifiersDetector';
import { ObjectExpressionCalleeDataExtractor } from '../../../analyzers/stack-trace-analyzer/callee-data-extractors/ObjectExpressionCalleeDataExtractor';
import { StackTraceAnalyzer } from '../../../analyzers/stack-trace-analyzer/StackTraceAnalyzer';
import { VariableDeclarationIdentifiersDetector } from '../../../analyzers/block-scope-analyzer/declaration-identifiers-detectors/VariableDeclarationIdentifiersDetector';

export const analyzersModule: interfaces.ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    // stack trace analyzer
    bind<IStackTraceAnalyzer>(ServiceIdentifiers.IStackTraceAnalyzer)
        .to(StackTraceAnalyzer)
        .inSingletonScope();

    // block scope analyzer
    bind<IBlockScopeAnalyzer>(ServiceIdentifiers.IBlockScopeAnalyzer)
        .to(BlockScopeAnalyzer)
        .inSingletonScope();

    // callee data extractors
    bind<ICalleeDataExtractor>(ServiceIdentifiers.ICalleeDataExtractor)
        .to(FunctionDeclarationCalleeDataExtractor)
        .whenTargetNamed(CalleeDataExtractor.FunctionDeclarationCalleeDataExtractor);

    bind<ICalleeDataExtractor>(ServiceIdentifiers.ICalleeDataExtractor)
        .to(FunctionExpressionCalleeDataExtractor)
        .whenTargetNamed(CalleeDataExtractor.FunctionExpressionCalleeDataExtractor);

    bind<ICalleeDataExtractor>(ServiceIdentifiers.ICalleeDataExtractor)
        .to(ObjectExpressionCalleeDataExtractor)
        .whenTargetNamed(CalleeDataExtractor.ObjectExpressionCalleeDataExtractor);

    // declaration identifiers detectors
    bind<IDeclarationIdentifiersDetector>(ServiceIdentifiers.IDeclarationIdentifiersDetector)
        .to(FunctionDeclarationIdentifiersDetector)
        .whenTargetNamed(DeclarationIdentifiersDetector.FunctionDeclarationIdentifiersDetector);

    bind<IDeclarationIdentifiersDetector>(ServiceIdentifiers.IDeclarationIdentifiersDetector)
        .to(FunctionExpressionDeclarationIdentifiersDetector)
        .whenTargetNamed(DeclarationIdentifiersDetector.FunctionExpressionDeclarationIdentifiersDetector);

    bind<IDeclarationIdentifiersDetector>(ServiceIdentifiers.IDeclarationIdentifiersDetector)
        .to(VariableDeclarationIdentifiersDetector)
        .whenTargetNamed(DeclarationIdentifiersDetector.VariableDeclarationIdentifiersDetector);

    // node callee data extractor factory
    bind<ICalleeDataExtractor>(ServiceIdentifiers.Factory__ICalleeDataExtractor)
        .toFactory<ICalleeDataExtractor>(InversifyContainerFacade
            .getCacheFactory<CalleeDataExtractor, ICalleeDataExtractor>(
                ServiceIdentifiers.ICalleeDataExtractor
            ));

    // declaration identifiers detector factory
    bind<IDeclarationIdentifiersDetector>(ServiceIdentifiers.Factory__IDeclarationIdentifiersDetector)
        .toFactory<IDeclarationIdentifiersDetector>(InversifyContainerFacade
            .getCacheFactory<DeclarationIdentifiersDetector, IDeclarationIdentifiersDetector>(
                ServiceIdentifiers.IDeclarationIdentifiersDetector
            ));
});
