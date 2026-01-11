import {
  DecoratorManager,
  MetadataManager,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';

export const CLI_QUESTION_SET_KEY = 'commander:questionSet';
export const CLI_QUESTION_KEY = 'commander:question';
export const CLI_QUESTION_FOR_KEY = 'commander:questionFor';

export interface QuestionSetOptions {
  name: string;
}

export type QuestionValue = unknown;

export type QuestionWhen = (
  answers: Record<string, QuestionValue>
) => boolean | Promise<boolean>;

export type QuestionValidate = (
  value: QuestionValue,
  answers?: Record<string, QuestionValue>
) => boolean | string | Promise<boolean | string>;

export type QuestionChoices =
  | Array<unknown>
  | ((answers?: Record<string, QuestionValue>) => Array<unknown> | Promise<Array<unknown>>);

export type QuestionMessage =
  | string
  | ((answers?: Record<string, QuestionValue>) => string | Promise<string>);

export type QuestionInitial =
  | QuestionValue
  | ((answers?: Record<string, QuestionValue>) => QuestionValue | Promise<QuestionValue>);

export type QuestionResult = (
  value: QuestionValue,
  answers?: Record<string, QuestionValue>
) => QuestionValue | Promise<QuestionValue>;

export interface QuestionOptions {
  name: string;
  type?: string;
  message?: QuestionMessage;
  choices?: QuestionChoices;
  validate?: QuestionValidate;
  when?: QuestionWhen | boolean;
  default?: QuestionInitial;
  initial?: QuestionInitial;
  result?: QuestionResult;
  [key: string]: unknown;
}

export interface QuestionMeta {
  propertyKey: string | symbol;
  options: QuestionOptions;
}

export type QuestionForType =
  | 'validate'
  | 'choices'
  | 'message'
  | 'default'
  | 'when';

export interface QuestionForOptions {
  name: string;
}

export interface QuestionForMeta {
  propertyKey: string | symbol;
  options: QuestionForOptions;
  type: QuestionForType;
}

export function QuestionSet(options: QuestionSetOptions): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(CLI_QUESTION_SET_KEY, target);
    MetadataManager.defineMetadata(CLI_QUESTION_SET_KEY, options, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function Question(options: QuestionOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) => {
    void _descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_KEY,
      {
        propertyKey,
        options,
      },
      target.constructor
    );
  };
}

export function ValidateFor(options: QuestionForOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    void descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_FOR_KEY,
      {
        propertyKey,
        type: 'validate',
        options,
      },
      target.constructor
    );
  };
}

export function ChoicesFor(options: QuestionForOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    void descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_FOR_KEY,
      {
        propertyKey,
        type: 'choices',
        options,
      },
      target.constructor
    );
  };
}

export function MessageFor(options: QuestionForOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    void descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_FOR_KEY,
      {
        propertyKey,
        type: 'message',
        options,
      },
      target.constructor
    );
  };
}

export function DefaultFor(options: QuestionForOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    void descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_FOR_KEY,
      {
        propertyKey,
        type: 'default',
        options,
      },
      target.constructor
    );
  };
}

export function WhenFor(options: QuestionForOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    void descriptor;
    MetadataManager.attachMetadata(
      CLI_QUESTION_FOR_KEY,
      {
        propertyKey,
        type: 'when',
        options,
      },
      target.constructor
    );
  };
}
