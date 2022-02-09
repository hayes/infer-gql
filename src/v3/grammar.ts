import { Block, Condition, Group, Line, List, Literal, SyntaxNode, Word } from './syntax';

export interface DocumentBlock
  extends Block<{
    '"""': BlockCommentSyntax;
    '#': CommentSyntax;
    scalar: ScalarSyntax;
    input: InputSyntax;
    enum: EnumSyntax;
    type: TypeSyntax;
    interface: InterfaceSyntax;
    union: UnionSyntax;
    directive: DirectiveDefinitionSyntax;
  }> {
  end: '';
}

export interface QueryBlock
  extends Block<{
    '"""': BlockCommentSyntax;
    '#': CommentSyntax;
    query: QuerySyntax;
    fragment: FragmentSyntax;
  }> {
  end: '';
}

export interface ScalarSyntax
  extends SyntaxNode<
    'Scalar',
    [{ name: 'kind'; kind: Literal<'scalar'> }, { name: 'name'; kind: Word<' ' | '\n'> }]
  > {}

export interface DirectiveDefinitionSyntax
  extends SyntaxNode<
    'DirectiveDefinition',
    [
      { name: 'kind'; kind: Literal<'directive'> },
      { name: 'name'; kind: Word<' ' | '\n' | '('> },
      { name: 'args'; kind: FieldArguments; optional: true },
      { name: 'onKeyword'; kind: Literal<'on'> },
      { name: 'on'; kind: List<Word<' ' | '\n' | '|'>, '|'> },
    ]
  > {}

export interface Directive
  extends SyntaxNode<
    'Directive',
    [
      { name: '@'; kind: Literal<'@'> },
      { name: 'name'; kind: Word<' ' | '\n' | '('> },
      { name: 'args'; kind: Arguments; optional: true },
    ]
  > {}

export interface Arguments extends Block<{}, Argument> {
  end: `)`;
  start: '(';
  separator: ',';
}

export interface Argument
  extends SyntaxNode<
    'Argument',
    [{ name: 'name'; kind: Word<' ' | '\n' | ':' | ')'> }, { name: 'value'; kind: ArgumentValue }]
  > {}

export interface ArgumentValue
  extends SyntaxNode<
    'ArgumentValue',
    [{ name: ':'; kind: ColonSyntax }, { name: 'value'; kind: Word<',' | ')'> }]
  > {}

export interface UnionSyntax
  extends SyntaxNode<
    'Union',
    [
      { name: 'kind'; kind: Literal<'union'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: '='; kind: EqualsSyntax },
      { name: 'members'; kind: List<Word<' ' | '\n' | '|'>, '|'> },
    ]
  > {}

export interface CommentSyntax
  extends SyntaxNode<
    'Comment',
    [{ name: 'kind'; kind: Literal<'#'> }, { name: 'body'; kind: Line }]
  > {}

export interface EqualsSyntax extends Literal<'='> {}

export interface ColonSyntax extends Literal<':'> {}

export interface ExclamationSyntax extends Literal<'!'> {}

export interface BlockCommentSyntax
  extends SyntaxNode<'BlockComment', [{ name: 'body'; kind: Group<'"""', '"""'> }]> {}

export interface TypeBody
  extends Block<
    {
      '"""': BlockCommentSyntax;
      '#': CommentSyntax;
    },
    FieldDefinition
  > {
  end: `}`;
  start: '{';
}

export interface InputBody
  extends Block<
    {
      '"""': BlockCommentSyntax;
      '#': CommentSyntax;
    },
    InputFieldDefinition
  > {
  end: `}`;
  start: '{';
}

export interface EnumBody
  extends Block<
    {
      '"""': BlockCommentSyntax;
      '#': CommentSyntax;
    },
    Word
  > {
  end: `}`;
  start: '{';
}

export interface FieldArguments extends Block<{}, InputFieldDefinition> {
  end: `)`;
  start: '(';
  separator: ',';
}

export interface DefaultValue
  extends SyntaxNode<
    'DefaultValue',
    [{ name: '='; kind: EqualsSyntax }, { name: 'value'; kind: Word<',' | ')' | '@'> }]
  > {}

export interface InputFieldDefinition
  extends SyntaxNode<
    'InputFieldDefinition',
    [
      { name: 'name'; kind: Word<' ' | '\n' | ':' | ')'> },
      { name: ':'; kind: ColonSyntax },
      { name: 'type'; kind: Word<' ' | '\n' | ',' | ')'> },
      { name: 'default'; kind: DefaultValue; optional: true },
      { name: 'directives'; kind: Directive; repeat: true },
    ]
  > {}

export interface FieldDefinition
  extends SyntaxNode<
    'FieldDefinition',
    [
      { name: 'name'; kind: Word<' ' | '\n' | ':' | '('> },
      { name: 'args'; kind: FieldArguments; optional: true },
      { name: ':'; kind: ColonSyntax },
      { name: 'type'; kind: Word<' ' | '\n' | ',' | ')' | '@'> },
      { name: 'directives'; kind: Directive; repeat: true },
    ]
  > {}

export interface TypeSyntax
  extends SyntaxNode<
    'Type',
    [
      { name: 'kind'; kind: Literal<'type'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: 'implements'; kind: ImplementsList; optional: true },
      { name: 'directives'; kind: Directive; repeat: true },
      { name: 'body'; kind: TypeBody },
    ]
  > {}

export interface ImplementsList
  extends SyntaxNode<
    'Implements',
    [
      { name: 'kind'; kind: Literal<'implements'> },
      { name: 'interfaces'; kind: List<Word<',' | ' ' | '\n'>, ','>; optional: true },
    ]
  > {}

export interface InterfaceSyntax
  extends SyntaxNode<
    'Interface',
    [
      { name: 'kind'; kind: Literal<'interface'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: 'implements'; kind: ImplementsList; optional: true },
      { name: 'body'; kind: TypeBody },
    ]
  > {}

export interface InputSyntax
  extends SyntaxNode<
    'Input',
    [
      { name: 'kind'; kind: Literal<'input'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: 'body'; kind: InputBody },
    ]
  > {}

export interface EnumSyntax
  extends SyntaxNode<
    'Enum',
    [
      { name: 'kind'; kind: Literal<'enum'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: 'body'; kind: EnumBody },
    ]
  > {}

export interface QuerySyntax
  extends SyntaxNode<
    'Query',
    [
      { name: 'kind'; kind: Literal<'query'> },
      { name: 'name'; kind: Word<' ' | '\n' | '(' | '{'>; optional: true },
      { name: 'variables'; kind: FieldArguments; optional: true },
      { name: 'body'; kind: QueryBody },
    ]
  > {}

export interface QueryBody
  extends Block<
    {
      '"""': BlockCommentSyntax;
      '#': CommentSyntax;
      '...': FragmentSpread;
    },
    FieldSelection
  > {
  end: `}`;
  start: '{';
}

export interface FieldSelection
  extends SyntaxNode<
    'FieldSelection',
    [
      { name: 'name'; kind: Word<' ' | '\n' | ':' | '(' | ' {' | '}'> },
      { name: 'args'; kind: Arguments; optional: true },
      { name: 'selections'; kind: QueryBody; optional: true },
    ]
  > {}

export interface FragmentSyntax
  extends SyntaxNode<
    'Fragment',
    [
      { name: 'kind'; kind: Literal<'fragment'> },
      { name: 'name'; kind: Word<' ' | '\n'> },
      { name: 'on'; kind: Literal<'on'> },
      { name: 'type'; kind: Word<' ' | '\n' | '{'> },
      { name: 'body'; kind: QueryBody },
    ]
  > {}

export interface FragmentSpread
  extends SyntaxNode<
    'FragmentSpread',
    [
      { name: '...'; kind: Literal<'...'> },
      { name: 'fragment'; kind: Condition<`on ${string}`, InlineFragment, Word<' ' | '\n' | '}'>> },
    ]
  > {}

export interface InlineFragment
  extends SyntaxNode<
    'InlineFragment',
    [
      { name: 'on'; kind: Literal<'on'> },
      { name: 'type'; kind: Word<' ' | '\n' | '{'> },
      { name: 'body'; kind: QueryBody },
    ]
  > {}
