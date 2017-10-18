import { IDeclarationIdentifiersDetector } from '../../../interfaces/analyzers/block-scope-analyzer/IDeclarationIdentifiersDetector';

import { DeclarationIdentifiersDetector } from '../../../enums/analyzers/declaration-identifiers-detectors/DeclarationIdentifiersDetector';

export type TDeclarationIdentifiersDetectorFactory = (declarationIdentifiersDetectorName: DeclarationIdentifiersDetector) => IDeclarationIdentifiersDetector;
