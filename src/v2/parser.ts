import { Trim, TrimLeft } from '../util';

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

interface PairSection {
  kind: 'PairSection';
  start: string;
  end: string;
}

interface Section {
  kind: 'Section';
  content: string;
}

interface Keyword extends Section {
  type: 'Keyword';
  content:
    | 'type'
    | 'interface'
    | 'enum'
    | 'union'
    | 'input'
    | 'scalar'
    | 'directive'
    | 'query'
    | 'mutation'
    | 'subscription'
    | 'fragment'
    | 'extends';
}

interface TextSection extends Section {
  type: 'TextSection';
}

type Syntax = PairSection | Section;

interface Comment extends PairSection {
  type: 'Comment';
  start: '#';
  end: '\n';
}

interface Block extends PairSection {
  type: 'Block';
  start: '{';
  end: '}';
}

type Grammar = Comment | Block | Keyword | TextSection;

type MatchString<T extends string, Key extends string> = {
  [K in Key]: T extends `${infer Before}${K}${infer After}`
    ? { key: K; match: `${Before}${string}`; before: Before; after: After }
    : never;
};

type MatchRecord = { match: string; before: string; after: string; key: string };

type GetMatch<Matches, K> = K extends keyof Matches
  ? (Matches[keyof Matches] & MatchRecord)['match'] extends (Matches[K] & MatchRecord)['match']
    ? Matches[K]
    : never
  : never;

type First<T extends string, Key extends string> = [MatchString<T, Key>] extends [infer Matches]
  ? {
      [K in Key]: GetMatch<Matches, K>;
    }[Key]
  : never;

type MatchPairStart<Grammar extends Syntax, T extends string> = Grammar extends infer S
  ? S extends PairSection
    ? T extends `${S['start']}${infer Content}${S['end']}${infer After}`
      ? {
          type: S;
          content: Trim<Content>;
          after: After;
        }
      : never
    : never
  : never;

type MatchTextSection<Grammar extends Syntax, T extends string> = First<
  T,
  (Grammar & PairSection)['start']
> extends { before: infer Content; key: infer K; after: infer After }
  ? {
      type: Text;
      content: Trim<Content & string>;
      after: `${K & string}${After & string}`;
    }
  : {
      type: Text;
      content: T;
      after: '';
    };

type ParseGrammar<
  Grammar extends Syntax,
  T extends string,
  Nodes extends unknown[] = [],
> = T extends Trim<T>
  ? T extends ''
    ? Nodes
    : MatchPairStart<Grammar, T> extends infer Pair
    ? [Pair] extends [never]
      ? MatchTextSection<Grammar, T> extends infer Text
        ? [Text] extends [never]
          ? never
          : ParseGrammar<
              Grammar,
              (Text & { after: string })['after'],
              [
                ...Nodes,
                {
                  type: Section;
                  content: (Text & Section)['content'];
                },
              ]
            >
        : never
      : [Pair] extends [
          {
            type: infer Type;
            content: infer Content;
            after: infer After;
          },
        ]
      ? ParseGrammar<
          Grammar,
          After & string,
          [
            ...Nodes,
            {
              type: Type;
              content: Content;
            },
          ]
        >
      : never
    : never
  : ParseGrammar<Grammar, Trim<T>, Nodes>;

type Result = ParseGrammar<Grammar, SDL>;
