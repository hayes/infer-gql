import { ParseNode } from './parser';
import { DocumentBlock, QueryBlock } from './grammar';

export type SDL = /* graphql */ `
  directive @deprecated(
    reason: String = "No longer supported"
  ) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | ENUM_VALUE

  """
  block
  comment
  """
  # comment
  scalar Date2
  union Text = User | Post
  input UserInput {
    id: String! = "1" @test @deprecated(reason: "test")
  }
  
  type Query { 
    me: User! @test @deprecated(reason: "test")
    user(input: UserInput = { }, id: ID!): User!
    # comment
    users(input: UserInput, id: ID!): [User!]! 
  }
  
  interface Node { id: ID! }
  interface Authored implements Node { id: ID! author: User! }
  type User @test @deprecated(reason: "test") { id: ID name: String! diet: Diet friends: [User!]! }
  type Post implements Authored , ID { author: User! }
  type Comment { author: User! }
  enum Diet {
    CARNIVOROUS
    HERBIVOROUS
    OMNIVORIOUS
  }
`;

export type ExampleQuery = /* graphql */ `
  # comment
  query exampleQuery($id: ID) {
    user(id: "123") {
      ID
    }
    me {
      id
      name
      # comment
      """
      block comment
      """
      ...UserSelection
      ...on User {
        diet
      }
    }
  }

  fragment UserSelection on User {
    name
    friends {
     id
    }
  }
`;

export type ParseDocument<T extends string> = ParseNode<T, DocumentBlock>;
export type ParseQuery<T extends string> = ParseNode<T, QueryBlock>;

export type Parsed = ParseDocument<SDL>;

export type ParsedQuery = ParseQuery<ExampleQuery>['node'][1]['body'];
