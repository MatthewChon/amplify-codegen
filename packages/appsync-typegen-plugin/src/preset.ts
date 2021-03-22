import { Types } from '@graphql-codegen/plugin-helpers';
import { Kind, TypeDefinitionNode } from 'graphql';
import { join } from 'path';
import { JAVA_SCALAR_MAP, SWIFT_SCALAR_MAP, TYPESCRIPT_SCALAR_MAP, DART_SCALAR_MAP } from './scalars';
import { LOADER_CLASS_NAME, GENERATED_PACKAGE_NAME } from './configs/java-config';

const APPSYNC_DATA_STORE_CODEGEN_TARGETS = ['java', 'swift', 'javascript', 'typescript', 'dart'];

export type AppSyncTypeCodeGenPresetConfig = {
  /**
   * @name target
   * @type string
   * @description Required, target language for codegen
   *
   * @example
   * ```yml
   * generates:
   * Models:
   *  preset: amplify-codegen-appsync-model-plugin
   *  presetConfig:
   *    target: java
   *  plugins:
   *    - amplify-codegen-appsync-model-plugin
   * ```
   */
  target: 'java' | 'swift' | 'javascript' | 'typescript' | 'dart';
};

const generateJavaPreset = (
  options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>,
  models: TypeDefinitionNode[],
): Types.GenerateOptions[] => {
  const config: Types.GenerateOptions[] = [];
  const baseOutputDir = [options.baseOutputDir, ...GENERATED_PACKAGE_NAME.split('.')];
  models.forEach(model => {
    const modelName = model.name.value;
    config.push({
      ...options,
      filename: join(...baseOutputDir, `${modelName}.java`),
      config: {
        ...options.config,
        scalars: { ...JAVA_SCALAR_MAP, ...options.config.scalars },
        selectedType: modelName,
      },
    });
  });

  // Class loader
  config.push({
    ...options,
    filename: join(...baseOutputDir, `${LOADER_CLASS_NAME}.java`),
    config: {
      ...options.config,
      scalars: { ...JAVA_SCALAR_MAP, ...options.config.scalars },
      generate: 'loader',
    },
  });

  return config;
};

const generateSwiftPreset = (
  options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>,
  models: TypeDefinitionNode[],
): Types.GenerateOptions[] => {
  const config: Types.GenerateOptions[] = [];
  models.forEach(model => {
    const modelName = model.name.value;
    config.push({
      ...options,
      filename: join(options.baseOutputDir, `${modelName}.swift`),
      config: {
        ...options.config,
        scalars: { ...SWIFT_SCALAR_MAP, ...options.config.scalars },
        generate: 'code',
        selectedType: modelName,
      },
    });
    if (model.kind !== Kind.ENUM_TYPE_DEFINITION) {
      config.push({
        ...options,
        filename: join(options.baseOutputDir, `${modelName}+Schema.swift`),
        config: {
          ...options.config,
          target: 'swift',
          scalars: { ...SWIFT_SCALAR_MAP, ...options.config.scalars },
          generate: 'metadata',
          selectedType: modelName,
        },
      });
    }
  });

  // class loader
  config.push({
    ...options,
    filename: join(options.baseOutputDir, `AmplifyModels.swift`),
    config: {
      ...options.config,
      scalars: { ...SWIFT_SCALAR_MAP, ...options.config.scalars },
      target: 'swift',
      generate: 'loader',
    },
  });
  return config;
};

const generateTypeScriptPreset = (
  options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>,
  models: TypeDefinitionNode[],
): Types.GenerateOptions[] => {
  const config: Types.GenerateOptions[] = [];
  const modelFolder = join(options.baseOutputDir, 'models');
  config.push({
    ...options,
    filename: join(modelFolder, 'index.ts'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      metadata: false,
    },
  });
  // metadata
  config.push({
    ...options,
    filename: join(modelFolder, 'schema.ts'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      target: 'metadata',
      metadataTarget: 'typescript',
    },
  });
  return config;
};

const generateJavasScriptPreset = (
  options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>,
  models: TypeDefinitionNode[],
): Types.GenerateOptions[] => {
  const config: Types.GenerateOptions[] = [];
  const modelFolder = join(options.baseOutputDir, 'models');
  config.push({
    ...options,
    filename: join(modelFolder, 'index.js'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      metadata: false,
    },
  });

  //indx.d.ts
  config.push({
    ...options,
    filename: join(modelFolder, 'index.d.ts'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      metadata: false,
      isDeclaration: true,
    },
  });
  // metadata schema.js
  config.push({
    ...options,
    filename: join(modelFolder, 'schema.js'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      target: 'metadata',
      metadataTarget: 'javascript',
    },
  });

  // schema.d.ts
  config.push({
    ...options,
    filename: join(modelFolder, 'schema.d.ts'),
    config: {
      ...options.config,
      scalars: { ...TYPESCRIPT_SCALAR_MAP, ...options.config.scalars },
      target: 'metadata',
      metadataTarget: 'typeDeclaration',
    },
  });
  return config;
};

const generateDartPreset = (
  options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>,
  models: TypeDefinitionNode[],
): Types.GenerateOptions[] => {
  const config: Types.GenerateOptions[] = [];
  models.forEach(model => {
    const modelName = model.name.value;
    config.push({
      ...options,
      filename: join(options.baseOutputDir, `${modelName}.dart`),
      config: {
        ...options.config,
        scalars: { ...DART_SCALAR_MAP, ...options.config.scalars },
        selectedType: modelName,
      },
    });
  });
  // Class loader
  config.push({
    ...options,
    filename: join(options.baseOutputDir, `ModelProvider.dart`),
    config: {
      ...options.config,
      scalars: { ...DART_SCALAR_MAP, ...options.config.scalars },
      generate: 'loader',
    },
  });
  return config;
};

export const preset: Types.OutputPreset<AppSyncTypeCodeGenPresetConfig> = {
  buildGeneratesSection: (options: Types.PresetFnArgs<AppSyncTypeCodeGenPresetConfig>): Types.GenerateOptions[] => {
    const codeGenTarget = options.config.target;

    const models: TypeDefinitionNode[] = options.schema.definitions.filter(
      t => t.kind === 'ObjectTypeDefinition' || (t.kind === 'EnumTypeDefinition' && !t.name.value.startsWith('__')),
    ) as any;

    switch (codeGenTarget) {
      case 'java':
        return generateJavaPreset(options, models);
      case 'swift':
        return generateSwiftPreset(options, models);
      case 'javascript':
        return generateJavasScriptPreset(options, models);
      case 'typescript':
        return generateTypeScriptPreset(options, models);
      case 'dart':
        return generateDartPreset(options, models);
      default:
        throw new Error(
          `amplify-codegen-appsync-model-plugin not support language target ${codeGenTarget}. Supported codegen targets arr ${APPSYNC_DATA_STORE_CODEGEN_TARGETS.join(
            ', ',
          )}`,
        );
    }
  },
};
