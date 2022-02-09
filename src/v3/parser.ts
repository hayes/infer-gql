import { TrimLeft } from '../util';
import {
  Block,
  Group,
  Line,
  List,
  Literal,
  SyntaxNode,
  Syntax,
  SyntaxChild,
  Word,
  Condition,
} from './syntax';

export type Normalize<T> = T extends object ? { [K in keyof T]: T[K] } : T;

type NodeWithChildren<T extends string, S extends Syntax> = ParseChildren<
  T,
  S['children']
> extends infer Children
  ? Children extends { map: infer Map; remaining: infer R }
    ? {
        node: Normalize<
          Map & {
            syntaxType: S;
          }
        >;
        remaining: R;
      }
    : never
  : never;

type ParseLiteral<
  T extends string,
  S extends Literal,
> = TrimLeft<T> extends `${S['value']}${infer Rest}`
  ? { node: S['value']; remaining: Rest }
  : never;

type BlockEnd<T, S extends Block> = S['end'] extends ''
  ? '' extends T
    ? ''
    : false
  : T extends `${S['end']}${infer R}`
  ? R
  : false;

type AddBlockChild<S extends Block, Child, Acc extends unknown[]> = Child extends {
  node: unknown;
  remaining: string;
}
  ? string extends S['separator']
    ? ParseBlockContent<TrimLeft<Child['remaining']>, S, [...Acc, Child['node']]>
    : TrimLeft<Child['remaining']> extends `${S['separator']}${infer R}`
    ? ParseBlockContent<TrimLeft<R>, S, [...Acc, Child['node']]>
    : ParseBlockContent<TrimLeft<Child['remaining']>, S, [...Acc, Child['node']]>
  : never;

export type ParseBlockContent<T extends string, S extends Block, Acc extends unknown[]> = BlockEnd<
  T,
  S
> extends infer End
  ? End extends string
    ? {
        node: Acc;
        remaining: End;
      }
    : {
        [K in keyof S['types']]: T extends `${K & string}${string}` ? S['types'][K] : never;
      }[keyof S['types']] extends infer Type
    ? [Type] extends [never]
      ? Syntax extends S['default']
        ? never
        : AddBlockChild<S, ParseNode<T, S['default']>, Acc>
      : AddBlockChild<S, ParseNode<T, Type>, Acc>
    : never
  : never;

export type ParseBlockSyntax<T extends string, S extends Block> = string extends S['start']
  ? ParseBlockContent<T, S, []>
  : T extends `${S['start']}${infer Rest}`
  ? ParseBlockContent<TrimLeft<Rest>, S, []>
  : never;

export type ParseConditional<T extends string, S extends Condition> = ParseNode<
  T,
  T extends S['test'] ? S['pass'] : S['fail']
>;

type ParseLineSyntax<T extends string> = T extends `${infer L}\n${infer Rest}`
  ? {
      node: L;
      remaining: Rest;
    }
  : {
      node: T;
      remaining: '';
    };

export type ParseWordSyntax<
  T extends string,
  S extends Word,
> = TrimLeft<T> extends `${infer Word}${S['end']}${string}`
  ? { [K in Word]: [Word] extends [`${K}${string}`] ? K : never }[Word] extends infer W
    ? {
        node: W;
        remaining: T extends `${W & string}${infer R}` ? R : never;
      }
    : never
  : { node: TrimLeft<T>; remaining: '' };

type ParseGroupSyntax<
  T extends string,
  S extends Group,
> = TrimLeft<T> extends `${S['start']}${infer Body}`
  ? Body extends `${infer Content}${S['end']}${infer R}`
    ? {
        node: Content;
        remaining: R;
      }
    : never
  : never;

type ParseListSyntax<T extends string, S extends List, Nodes extends unknown[] = []> = ParseNode<
  T,
  S['ofType']
> extends infer Parsed
  ? [Parsed] extends [never]
    ? { remaining: T; node: { type: T; items: Nodes } }
    : Parsed extends { remaining: infer R; node: infer N }
    ? TrimLeft<R & string> extends `${S['separator']}${infer Rest}`
      ? ParseListSyntax<Rest, S, [...Nodes, N]>
      : { remaining: R; node: { type: S; items: [...Nodes, N] } }
    : never
  : never;

type ParseChildren<
  T extends string,
  Children,
  End = null,
  Map extends {} = {},
> = [] extends Children
  ? { remaining: T; map: Map }
  : TrimLeft<T> extends `${End & string}${string}`
  ? { remaining: T; map: Map }
  : Children extends [infer Child, ...infer Rest]
  ? Child extends SyntaxChild
    ? Child['repeat'] extends true
      ? ParseNodes<T, Child['kind']> extends infer ParsedChild
        ? ParsedChild extends { nodes: infer Nodes; remaining: infer Remaining }
          ? ParseChildren<Remaining & string, Rest, End, Map & { [K in Child['name']]: Nodes }>
          : ParsedChild
        : never
      : Child['optional'] extends true
      ? ParseNode<T, Child['kind']> extends infer ParsedChild
        ? [ParsedChild] extends [never]
          ? ParseChildren<T, Rest, End, Map>
          : ParsedChild extends { node: infer Node; remaining: infer Remaining }
          ? ParseChildren<Remaining & string, Rest, End, Map & { [K in Child['name']]: Node }>
          : { remaining: T; map: Map }
        : never
      : ParseNode<T, Child['kind']> extends infer ParsedChild
      ? ParsedChild extends { node: infer Node; remaining: infer Remaining }
        ? ParseChildren<Remaining & string, Rest, End, Map & { [K in Child['name']]: Node }>
        : { remaining: T; map: Map }
      : never
    : never
  : never;

export type ParseNode<T extends string, S> = S extends Literal
  ? ParseLiteral<T, S>
  : S extends SyntaxNode
  ? NodeWithChildren<T, S>
  : S extends Line
  ? ParseLineSyntax<T>
  : S extends Word
  ? ParseWordSyntax<TrimLeft<T>, S>
  : S extends Group
  ? ParseGroupSyntax<T, S>
  : S extends List
  ? ParseListSyntax<T, S>
  : S extends Block
  ? ParseBlockSyntax<TrimLeft<T>, S>
  : S extends Condition
  ? ParseConditional<T, S>
  : {
      node: {
        type: null;
        expected: S;
      };
      remaining: T;
      kind: S;
    };

type ParseNodes<T extends string, S extends Syntax, Nodes extends unknown[] = []> = ParseNode<
  T,
  S
> extends infer ParsedNode
  ? [ParsedNode] extends [never]
    ? { remaining: T; nodes: Nodes }
    : ParsedNode extends { remaining: infer R; node: infer N }
    ? ParseNodes<R & string, S, [...Nodes, N]>
    : never
  : never;
