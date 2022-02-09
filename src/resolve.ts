import { GraphQLResolveInfo } from 'graphql';
import {
  FieldNode,
  InterfaceTypeNode,
  ObjectTypeNode,
  Parse,
  TypeNode,
  TypeRefNode,
} from './parser';

export interface BaseTypes {
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: number | string;
}

export type MaybePromise<T> = T | Promise<T>;

export type ShapeFromName<Types extends BaseTypes, Name extends string> = Name extends keyof Types
  ? Types[Name]
  : {};

export type ShapeFromTypeRef<Types extends BaseTypes, Ref extends TypeRefNode> = ShapeFromName<
  Types,
  Ref['name']
> extends infer Shape
  ? Ref extends { list: true }
    ? Ref extends { nonNull: true }
      ?
          | (Ref extends { listItemNonNull: true } ? Shape : Shape | null | undefined)[]
          | null
          | undefined
      : (Ref extends { listItemNonNull: true } ? Shape : Shape | null | undefined)[]
    : Ref extends { nonNull: true }
    ? Shape
    : Shape | null | undefined
  : never;

export type ResolverFromField<
  Parent extends string,
  T extends FieldNode,
  Types extends BaseTypes = BaseTypes,
  Context extends {} = {},
> = (
  parent: Parent extends keyof Types ? Types[Parent] : {},
  args: {
    [K in T['args'][number] as K['name']]: ShapeFromTypeRef<Types, K['type']>;
  },
  ctx: {},
  info: GraphQLResolveInfo,
) => MaybePromise<ShapeFromTypeRef<Types, T['type']>>;

export type ResolveTypes<
  T extends string,
  Types extends BaseTypes = BaseTypes,
  Context extends {} = {},
> = Parse<T> extends infer Tokens
  ? Tokens extends TypeNode[]
    ? {
        [K in Tokens[number] as K extends ObjectTypeNode ? K['name'] : never]: {
          [F in (K & ObjectTypeNode)['fields'][number] as F['name']]: ResolverFromField<
            K['name'],
            F,
            Types,
            Context
          >;
        };
      } & {
        [K in Tokens[number] as K extends InterfaceTypeNode ? K['name'] : never]?: {
          [F in (K & InterfaceTypeNode)['fields'][number] as F['name']]?: ResolverFromField<
            K['name'],
            F,
            Types,
            Context
          >;
        };
      }
    : Tokens
  : never;

export type SDL = `
  # comment
  scalar Date
  union Text = User | Post
  input UserInput {
    id: String!
  }
  type Query { 
    user(input: UserInput, id: ID!): User!
    users(input: UserInput, id: ID!): [User!]!
  }
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

export const resolvers: ResolveTypes<SDL, BaseTypes & { User: { id: number; name: string } }> = {
  Query: {
    user: (parent, args, ctx, info) => Promise.resolve({ id: 123, name: 'Name' }),
    users: (parent, args, ctx, info) => Promise.resolve([{ id: 123, name: 'Name' }]),
  },
  User: {
    id: (parent, args, ctx, info) => parent.id,
    name: (parent, args, ctx, info) => parent.name,
    diet: () => 'CARNIVOROUS',
  },
  Post: {
    author: (parent, args, ctx, info) => Promise.resolve({ id: 123, name: 'Name' }),
  },
  Comment: {
    author: (parent, args, ctx, info) => Promise.resolve({ id: 123, name: 'Name' }),
  },
};
