import { Tokenize } from './tokenizer';
import {
  BangToken,
  ColonToken,
  CommaToken,
  CommentToken,
  EqualsToken,
  LeftBraceToken,
  LeftBracketToken,
  LeftParenToken,
  NameToken,
  PipeToken,
  RightBraceToken,
  RightBracketToken,
  RightParenToken,
  Token,
} from './tokens';
import { ParseError } from './util';

export interface ObjectTypeNode<
  Name extends string = string,
  Fields extends FieldNode[] = FieldNode[],
  Interfaces extends string[] = string[],
> {
  kind: 'Object';
  name: Name;
  fields: Fields;
  interfaces: Interfaces;
}

export interface InterfaceTypeNode<
  Name extends string = string,
  Fields extends FieldNode[] = FieldNode[],
  Interfaces extends string[] = string[],
> {
  kind: 'Interface';
  name: Name;
  fields: Fields;
  interfaces: Interfaces;
}

export interface UnionTypeNode<Name extends string = string, Members extends string[] = string[]> {
  kind: 'Union';
  name: Name;
  members: Members;
}

export interface ScalarTypeNode<Name extends string = string> {
  kind: 'Scalar';
  name: Name;
}

export interface EnumTypeNode<Name extends string = string, Values extends string[] = string[]> {
  kind: 'Enum';
  name: Name;
  values: Values;
}

export interface InputTypeNode<
  Name extends string = string,
  Fields extends InputFieldNode[] = InputFieldNode[],
> {
  kind: 'Input';
  name: Name;
  fields: Fields;
}

export interface FieldNode<
  Name extends string = string,
  Args extends ArgNode[] = ArgNode[],
  Type extends TypeRefNode = TypeRefNode,
> {
  kind: 'Field';
  name: Name;
  args: Args;
  type: Type;
}

export interface InputFieldNode<
  Name extends string = string,
  Type extends TypeRefNode = TypeRefNode,
> {
  kind: 'Field';
  name: Name;
  type: Type;
}

export interface ArgNode<Name extends string = string, Type extends TypeRefNode = TypeRefNode> {
  kind: 'Arg';
  name: Name;
  type: Type;
}

export interface TypeRefNode<
  Name extends string = string,
  NonNull extends boolean = boolean,
  List extends boolean = boolean,
  ListItemNonNull extends boolean = boolean,
> {
  kind: 'TypeRef';
  name: Name;
  nonNull: NonNull;
  list: List;
  listItemNonNull: ListItemNonNull;
}

export type TypeNode =
  | ObjectTypeNode
  | InterfaceTypeNode
  | ScalarTypeNode
  | EnumTypeNode
  | UnionTypeNode
  | InputTypeNode;

export type TypeResult = { Rest: unknown[]; Type: TypeNode };
export type ArgsResult = { Rest: unknown[]; Args: ArgNode[] };
export type FieldBlockResult = { Rest: unknown[]; Fields: FieldNode[] };
export type InputFieldBlockResult = {
  Rest: unknown[];
  Fields: InputFieldNode[];
};
export type TypeRefResult = { Rest: unknown[]; Ref: TypeRefNode };
export type MembersResult = { Rest: unknown[]; Members: string[] };
export type EnumValuesResult = {
  Rest: unknown[];
  Values: string[];
};
export type ImplementsResult = { Rest: unknown[]; Interfaces: string[] };

export type Parse<T extends string> = Tokenize<T> extends infer Tokens
  ? Tokens extends Token[]
    ? ParseStatements<Tokens, []>
    : Tokens
  : never;

export type ParseStatements<T, Types extends TypeNode[]> = [] extends T
  ? Types
  : T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseType<Name, Types, Rest>
  : T extends [CommentToken, ...infer Rest]
  ? ParseStatements<Rest, Types>
  : UnexpectedToken<T>;

export type AddType<
  T extends TypeResult | ParseError,
  Types extends TypeNode[],
> = T extends TypeResult ? ParseStatements<T['Rest'], [...Types, T['Type']]> : UnexpectedToken<T>;

export type ParseType<Type extends string, Types extends TypeNode[], T> = Type extends 'type'
  ? AddType<ParseObjectType<T>, Types>
  : Type extends 'interface'
  ? AddType<ParseInterfaceType<T>, Types>
  : Type extends 'union'
  ? AddType<ParseUnionType<T>, Types>
  : Type extends 'scalar'
  ? AddType<ParseScalarType<T>, Types>
  : Type extends 'enum'
  ? AddType<ParseEnumType<T>, Types>
  : Type extends 'input'
  ? AddType<ParseInputType<T>, Types>
  : ParseError<`Unknown keyword ${Type}`>;

export type UnexpectedToken<T> = T extends Token
  ? ParseError<`Unexpected ${T['kind']} token (\`${T['value']}\`)`>
  : T extends unknown[]
  ? UnexpectedToken<T[0]>
  : T extends ParseError<string>
  ? T
  : ParseError<'Unexpected token'>;

export type ParseObjectType<T> = T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseImplements<Consume<Rest, CommentToken>> extends {
      Rest: infer R2;
      Interfaces: infer Interfaces;
    }
    ? ParseFieldBlock<Consume<R2, CommentToken>> extends infer Block
      ? Block extends FieldBlockResult
        ? {
            Type: ObjectTypeNode<
              Name,
              Block['Fields'],
              Interfaces extends string[] ? Interfaces : []
            >;
            Rest: Block['Rest'];
          }
        : Block
      : never
    : never
  : UnexpectedToken<T>;

export type ParseInterfaceType<T> = T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseImplements<Consume<Rest, CommentToken>> extends {
      Rest: infer R2;
      Interfaces: infer Interfaces;
    }
    ? ParseFieldBlock<Consume<R2, CommentToken>> extends infer Block
      ? Block extends FieldBlockResult
        ? {
            Type: InterfaceTypeNode<
              Name,
              Block['Fields'],
              Interfaces extends string[] ? Interfaces : []
            >;
            Rest: Block['Rest'];
          }
        : Block
      : never
    : never
  : UnexpectedToken<T>;

export type ParseInputType<T> = T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseInputFieldBlock<Consume<Rest, CommentToken>> extends infer Block
    ? Block extends InputFieldBlockResult
      ? {
          Type: InputTypeNode<Name, Block['Fields']>;
          Rest: Block['Rest'];
        }
      : Block
    : never
  : UnexpectedToken<T>;

export type ParseScalarType<T> = T extends [NameToken<infer Name>, ...infer Rest]
  ? { Type: ScalarTypeNode<Name>; Rest: Rest }
  : UnexpectedToken<T>;

export type ParseUnionType<T> = T extends [
  NameToken<infer Name>,
  EqualsToken,
  NameToken<infer Member>,
  ...infer Rest
]
  ? ParseUnionMembers<Rest, [Member]> extends infer R
    ? R extends MembersResult
      ? { Type: UnionTypeNode<Name, R['Members']>; Rest: R['Rest'] }
      : R
    : never
  : UnexpectedToken<T>;

export type ParseUnionMembers<T, Acc extends string[]> = T extends [PipeToken, ...infer Rest]
  ? Rest extends [NameToken<infer Name>, ...infer R2]
    ? ParseUnionMembers<R2, [...Acc, Name]>
    : UnexpectedToken<Rest>
  : { Rest: T; Members: Acc };

export type ParseEnumType<T> = T extends [NameToken<infer Name>, LeftBraceToken, ...infer Rest]
  ? ParseEnumValues<Rest, []> extends infer R
    ? R extends EnumValuesResult
      ? { Type: EnumTypeNode<Name, R['Values']>; Rest: R['Rest'] }
      : R
    : never
  : UnexpectedToken<T>;

export type ParseEnumValues<T, Acc extends string[]> = T extends [RightBraceToken, ...infer Rest]
  ? { Rest: Rest; Values: Acc }
  : T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseEnumValues<Rest, [...Acc, Name]>
  : UnexpectedToken<T>;

export type ParseImplements<T> = T extends [
  NameToken<'implements'>,
  NameToken<infer Name>,
  ...infer Rest
]
  ? ParseImplementList<Rest, [Name]>
  : { Rest: T; Interfaces: [] };

export type ParseImplementList<T, Acc extends string[]> = T extends [CommaToken, ...infer Rest]
  ? Rest extends [NameToken<infer Name>, ...infer R2]
    ? ParseImplementList<R2, [...Acc, Name]>
    : UnexpectedToken<Rest>
  : { Rest: T; Interfaces: Acc };

export type ParseFieldBlock<T> = T extends [LeftBraceToken, ...infer Rest]
  ? ParseFields<Consume<Rest, CommentToken>, []>
  : { Rest: T; Fields: [] };

export type ParseFields<T, Acc extends FieldNode[]> = T extends [
  NameToken<infer Name>,
  LeftParenToken,
  ...infer Rest
]
  ? ParseArgs<Consume<Rest, CommentToken>, []> extends infer R
    ? R extends ArgsResult
      ? ParseField<Name, R['Args'], R['Rest'], Acc>
      : R
    : never
  : T extends [NameToken<infer Name>, ...infer Rest]
  ? ParseField<Name, [], Rest, Acc>
  : T extends [RightBraceToken, ...infer Rest]
  ? { Rest: Rest; Fields: Acc }
  : UnexpectedToken<T>;

export type ParseField<
  Name extends string,
  Args extends ArgNode[],
  T,
  Acc extends FieldNode[],
> = T extends [ColonToken, ...infer Rest]
  ? ParseTypeRef<Rest> extends infer R
    ? R extends TypeRefResult
      ? ParseFields<R['Rest'], [...Acc, FieldNode<Name, Args, R['Ref']>]>
      : R
    : never
  : UnexpectedToken<T>;

export type ParseArgs<T, Acc extends ArgNode[]> = T extends [RightParenToken, ...infer Rest]
  ? { Args: Acc; Rest: Rest }
  : T extends [
      ...([] extends Acc ? [] : [CommaToken]),
      NameToken<infer Name>,
      ColonToken,
      ...infer Rest
    ]
  ? ParseTypeRef<Rest> extends infer R
    ? R extends TypeRefResult
      ? ParseArgs<R['Rest'], [...Acc, ArgNode<Name, R['Ref']>]>
      : R
    : never
  : UnexpectedToken<T>;

export type ParseInputFieldBlock<T> = T extends [LeftBraceToken, ...infer Rest]
  ? ParseInputFields<Consume<Rest, CommentToken>, []>
  : { Rest: T; Fields: [] };

export type ParseInputFields<T, Acc extends InputFieldNode[]> = T extends [
  NameToken<infer Name>,
  ...infer Rest
]
  ? ParseInputField<Name, Rest, Acc>
  : T extends [RightBraceToken, ...infer Rest]
  ? { Rest: Rest; Fields: Acc }
  : UnexpectedToken<T>;

export type ParseInputField<Name extends string, T, Acc extends InputFieldNode[]> = T extends [
  ColonToken,
  ...infer Rest
]
  ? ParseTypeRef<Rest> extends infer R
    ? R extends TypeRefResult
      ? ParseInputFields<R['Rest'], [...Acc, InputFieldNode<Name, R['Ref']>]>
      : R
    : never
  : UnexpectedToken<T>;

export type ParseTypeRef<T> = T extends [
  LeftBracketToken,
  infer Name,
  BangToken,
  RightBracketToken,
  BangToken,
  ...infer Rest
]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], true, true, true> }
    : UnexpectedToken<Name>
  : T extends [LeftBracketToken, infer Name, RightBracketToken, BangToken, ...infer Rest]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], true, true, false> }
    : UnexpectedToken<Name>
  : T extends [LeftBracketToken, infer Name, BangToken, RightBracketToken, ...infer Rest]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], false, true, true> }
    : UnexpectedToken<Name>
  : T extends [LeftBracketToken, infer Name, RightBracketToken, ...infer Rest]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], false, true, false> }
    : UnexpectedToken<Name>
  : T extends [infer Name, BangToken, ...infer Rest]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], true, false, false> }
    : UnexpectedToken<Name>
  : T extends [infer Name, ...infer Rest]
  ? Name extends NameToken
    ? { Rest: Rest; Ref: TypeRefNode<Name['value'], false, false, false> }
    : UnexpectedToken<Name>
  : UnexpectedToken<T>;

export type Consume<T, U> = T extends [infer First, ...infer Rest]
  ? First extends U
    ? Consume<Rest, U>
    : T
  : [];

export type ConsumeUntil<T, U> = T extends [infer First, ...infer Rest]
  ? First extends U
    ? Rest
    : ConsumeUntil<Rest, U>
  : [];

export type SDL = `
    # comment
    scalar Date
    union Text = User | Post
    input UserInput {
      id: String!
    }
    type Query { user(input: UserInput, id: ID!): User}
    interface Authored implements Node { id: ID! author: User! }
    interface Node { id: ID! }
    type User { id: ID name: String! diet: Diet }
    type Post implements Authored, ID { author: User! }
    type Comment { author: User! }
    enum Diet {
      CARNIVOROUS
      HERBIVOROUS
      OMNIVORIOUS
    }
`;

export type R = Parse<SDL>;
