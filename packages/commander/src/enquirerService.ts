import {
  DecoratorManager,
  MetadataManager,
  MidwayCommonError,
  ApplicationContext,
  Provide,
  Scope,
  ScopeEnum,
  IMidwayContainer,
} from '@midwayjs/core';
import enquirer = require('enquirer');
import {
  CLI_QUESTION_FOR_KEY,
  CLI_QUESTION_KEY,
  CLI_QUESTION_SET_KEY,
  QuestionForMeta,
  QuestionForType,
  QuestionMeta,
  QuestionOptions,
  QuestionResult,
  QuestionSetOptions,
  QuestionValue,
} from './question';

export interface PromptResult {
  [key: string]: QuestionValue;
}

type QuestionSetModule = new (...args: unknown[]) => Record<PropertyKey, unknown>;
type EnquirerPromptInput = Parameters<typeof enquirer.prompt>[0];

@Provide()
@Scope(ScopeEnum.Request)
export class EnquirerService {
  @ApplicationContext()
  private applicationContext: IMidwayContainer;

  async prompt<T extends PromptResult = PromptResult>(
    questionSetName: string,
    initialAnswers: PromptResult = {}
  ): Promise<T> {
    const questionSetModule = this.getQuestionSetModule(questionSetName);
    const questionSet = await this.applicationContext.getAsync(
      questionSetModule
    );
    const questions = this.buildQuestions(questionSetModule, questionSet);
    const answers = await this.runQuestions(questions, initialAnswers);
    return answers as T;
  }

  private getQuestionSetModule(
    questionSetName: string
  ): QuestionSetModule {
    const modules = DecoratorManager.listModule(CLI_QUESTION_SET_KEY);
    for (const module of modules) {
      const metadata = MetadataManager.getMetadata(
        CLI_QUESTION_SET_KEY,
        module
      ) as QuestionSetOptions;
      if (metadata?.name === questionSetName) {
        return module as QuestionSetModule;
      }
    }
    throw new MidwayCommonError(
      `QuestionSet "${questionSetName}" not found`
    );
  }

  private buildQuestions(
    module: QuestionSetModule,
    instance: Record<PropertyKey, unknown>
  ): Array<QuestionOptions> {
    const questionMetaList: QuestionMeta[] =
      MetadataManager.getMetadata(CLI_QUESTION_KEY, module) || [];
    const questionForMetaList: QuestionForMeta[] =
      MetadataManager.getMetadata(CLI_QUESTION_FOR_KEY, module) || [];

    return questionMetaList.map(meta => {
      const question: QuestionOptions = {
        ...meta.options,
      };

      if (!question.name) {
        throw new MidwayCommonError(
          `Question name is required in ${module?.name || 'QuestionSet'}`
        );
      }

      const candidate = instance[meta.propertyKey];
      const handler =
        typeof candidate === 'function'
          ? (candidate as QuestionResult).bind(instance)
          : undefined;
      if (handler) {
        question.result = handler;
      }

      const forHandlers = questionForMetaList.filter(
        item => item.options?.name === question.name
      );
      for (const forMeta of forHandlers) {
        const forCandidate = instance[forMeta.propertyKey];
        const bound =
          typeof forCandidate === 'function'
            ? (forCandidate as (...args: unknown[]) => unknown).bind(instance)
            : undefined;
        if (bound !== undefined) {
          this.applyQuestionFor(question, forMeta.type, bound);
        }
      }

      if (question.default !== undefined && question.initial === undefined) {
        question.initial = question.default;
        delete question.default;
      }

      return question;
    });
  }

  private applyQuestionFor(
    question: QuestionOptions,
    type: QuestionForType,
    handler: (...args: unknown[]) => unknown
  ) {
    switch (type) {
      case 'default':
        question.initial = handler as QuestionOptions['initial'];
        return;
      case 'validate':
        question.validate = handler as QuestionOptions['validate'];
        return;
      case 'choices':
        question.choices = handler as QuestionOptions['choices'];
        return;
      case 'message':
        question.message = handler as QuestionOptions['message'];
        return;
      case 'when':
        question.when = handler as QuestionOptions['when'];
        return;
      default:
        return;
    }
  }

  private async runQuestions(
    questions: Array<QuestionOptions>,
    initialAnswers: PromptResult
  ): Promise<PromptResult> {
    const answers: PromptResult = { ...initialAnswers };

    for (const question of questions) {
      const shouldAsk = await this.resolveWhen(question.when, answers);
      if (!shouldAsk) {
        continue;
      }
      const currentQuestion = { ...question };
      delete currentQuestion.when;
      if (!currentQuestion.type) {
        throw new MidwayCommonError(
          `Question "${currentQuestion.name}" type is required`
        );
      }
      const result = await enquirer.prompt(
        currentQuestion as EnquirerPromptInput
      );
      Object.assign(answers, result);
    }

    return answers;
  }

  private async resolveWhen(
    whenValue: QuestionOptions['when'],
    answers: PromptResult
  ) {
    if (typeof whenValue === 'function') {
      return Boolean(await whenValue(answers));
    }
    if (typeof whenValue === 'boolean') {
      return whenValue;
    }
    return true;
  }
}
